import { neon } from "@neondatabase/serverless";

// Lazy init — only connects at runtime when POSTGRES_URL is available,
// not during Next.js static build analysis.
function getDb() {
  if (!process.env.POSTGRES_URL) throw new Error("POSTGRES_URL is not set");
  return neon(process.env.POSTGRES_URL);
}

export async function setupSchema(): Promise<void> {
  const sql = getDb();
  await sql`CREATE EXTENSION IF NOT EXISTS vector`;

  await sql`
    CREATE TABLE IF NOT EXISTS video_embeddings (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      video_id    TEXT UNIQUE NOT NULL,
      title       TEXT,
      description TEXT,
      tags        TEXT[],
      channel_id  TEXT,
      embedding   vector(1024),
      topics      TEXT[],
      created_at  TIMESTAMPTZ DEFAULT now(),
      updated_at  TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS video_embeddings_ivfflat_idx
    ON video_embeddings
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id         TEXT PRIMARY KEY,
      interest_graph  JSONB NOT NULL DEFAULT '{}',
      channel_prefs   JSONB NOT NULL DEFAULT '{}',
      format_prefs    JSONB NOT NULL DEFAULT '{"shorts":0.33,"long_form":0.33,"tutorials":0.33}',
      negative_signals TEXT[] NOT NULL DEFAULT '{}',
      last_updated    TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS agent_traces (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id  TEXT NOT NULL,
      agent_name  TEXT NOT NULL,
      input       JSONB,
      output      JSONB,
      reasoning   TEXT,
      latency_ms  INTEGER,
      confidence  FLOAT,
      created_at  TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS agent_traces_session_idx ON agent_traces (session_id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS watch_events (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id         TEXT NOT NULL,
      video_id        TEXT NOT NULL,
      event_type      TEXT NOT NULL,
      watch_duration  INTEGER,
      created_at      TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS watch_events_user_idx ON watch_events (user_id, created_at DESC)`;
}

export async function upsertVideoEmbedding(
  videoId: string,
  title: string,
  description: string,
  tags: string[],
  channelId: string,
  embedding: number[],
  topics: string[]
): Promise<void> {
  const sql = getDb();
  const embeddingStr = `[${embedding.join(",")}]`;
  await sql`
    INSERT INTO video_embeddings (video_id, title, description, tags, channel_id, embedding, topics)
    VALUES (${videoId}, ${title}, ${description}, ${tags}, ${channelId}, ${embeddingStr}::vector, ${topics})
    ON CONFLICT (video_id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      tags = EXCLUDED.tags,
      embedding = EXCLUDED.embedding,
      topics = EXCLUDED.topics,
      updated_at = now()
  `;
}

export async function vectorSearch(
  embedding: number[],
  topK = 20,
  excludeIds: string[] = []
): Promise<{ video_id: string; title: string; channel_id: string; similarity: number }[]> {
  const sql = getDb();
  const embeddingStr = `[${embedding.join(",")}]`;

  type Row = { video_id: string; title: string; channel_id: string; similarity: number };

  if (excludeIds.length > 0) {
    return sql`
      SELECT video_id, title, channel_id,
             1 - (embedding <=> ${embeddingStr}::vector) AS similarity
      FROM video_embeddings
      WHERE video_id != ALL(${excludeIds})
      ORDER BY embedding <=> ${embeddingStr}::vector
      LIMIT ${topK}
    ` as unknown as Promise<Row[]>;
  }

  return sql`
    SELECT video_id, title, channel_id,
           1 - (embedding <=> ${embeddingStr}::vector) AS similarity
    FROM video_embeddings
    ORDER BY embedding <=> ${embeddingStr}::vector
    LIMIT ${topK}
  ` as unknown as Promise<Row[]>;
}

export async function saveAgentTrace(
  sessionId: string,
  agentName: string,
  input: unknown,
  output: unknown,
  reasoning: string,
  latencyMs: number,
  confidence: number
): Promise<void> {
  const sql = getDb();
  await sql`
    INSERT INTO agent_traces (session_id, agent_name, input, output, reasoning, latency_ms, confidence)
    VALUES (
      ${sessionId},
      ${agentName},
      ${JSON.stringify(input)},
      ${JSON.stringify(output)},
      ${reasoning},
      ${latencyMs},
      ${confidence}
    )
  `;
}
