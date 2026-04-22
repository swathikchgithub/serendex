import Anthropic from "@anthropic-ai/sdk";
import { searchYouTube, getVideoDetails } from "@/lib/youtube";
import { embedTexts, videoToText, cosineSimilarity } from "@/lib/embeddings";
import { upsertVideoEmbedding, vectorSearch } from "@/lib/db";
import type { Video, AgentTrace } from "@/types";

const client = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: "search_youtube",
    description: "Search YouTube for videos matching a query",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query" },
        max_results: { type: "number", description: "Max results (default 20)" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_video_details",
    description: "Get full details for specific video IDs",
    input_schema: {
      type: "object" as const,
      properties: {
        video_ids: { type: "array", items: { type: "string" }, description: "List of YouTube video IDs" },
      },
      required: ["video_ids"],
    },
  },
];

interface ContentAgentResult {
  candidates: (Video & { similarity_score: number })[];
  reasoning: string;
  confidence: number;
  trace: AgentTrace;
}

export async function runContentAnalysisAgent(
  seedVideos: Video[],
  userTopics: string[]
): Promise<ContentAgentResult> {
  const startedAt = new Date().toISOString();
  const toolsCalled: string[] = [];
  const allCandidates: Video[] = [];

  const query = [
    ...seedVideos.map((v) => v.title),
    ...userTopics,
  ].slice(0, 3).join(", ");

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `You are the Content Analysis Agent for SERENDEX. Find 20 videos semantically similar to these seed videos: ${JSON.stringify(seedVideos.map((v) => ({ title: v.title, tags: v.tags })))}.

User's known topics: ${userTopics.join(", ") || "unknown"}.

Use search_youtube to find relevant content. Make 2-3 targeted searches to maximize diversity of high-quality candidates.`,
    },
  ];

  let finalReasoning = "";

  // Agentic loop
  while (true) {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      tools,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find((b) => b.type === "text");
      finalReasoning = textBlock ? (textBlock as Anthropic.TextBlock).text : "";
      break;
    }

    if (response.stop_reason === "tool_use") {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type !== "tool_use") continue;
        toolsCalled.push(block.name);

        let result: Video[] = [];
        if (block.name === "search_youtube") {
          const input = block.input as { query: string; max_results?: number };
          result = await searchYouTube(input.query, input.max_results ?? 20);
          allCandidates.push(...result);
        } else if (block.name === "get_video_details") {
          const input = block.input as { video_ids: string[] };
          result = await getVideoDetails(input.video_ids);
          allCandidates.push(...result);
        }

        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result.map((v) => ({ video_id: v.video_id, title: v.title, tags: v.tags }))),
        });
      }

      messages.push({ role: "user", content: toolResults });
    }
  }

  // Deduplicate candidates
  const unique = Array.from(new Map(allCandidates.map((v) => [v.video_id, v])).values());

  // Compute cosine similarity against seed videos
  if (unique.length === 0 || seedVideos.length === 0) {
    return {
      candidates: [],
      reasoning: finalReasoning || `Searched for: ${query}`,
      confidence: 0.3,
      trace: buildTrace("content_analysis", startedAt, toolsCalled, 0, 0.3, finalReasoning),
    };
  }

  const seedTexts = seedVideos.map(videoToText);
  const candidateTexts = unique.map(videoToText);
  const allTexts = [...seedTexts, ...candidateTexts];
  const allEmbeddings = await embedTexts(allTexts);

  const seedEmbeddings = allEmbeddings.slice(0, seedTexts.length);
  const candidateEmbeddings = allEmbeddings.slice(seedTexts.length);

  // Persist candidate embeddings to pgvector for future searches
  await Promise.allSettled(
    unique.map((video, i) =>
      upsertVideoEmbedding(
        video.video_id,
        video.title,
        video.description,
        video.tags,
        video.channel_id,
        candidateEmbeddings[i],
        []
      )
    )
  );

  // Also search pgvector index for previously seen similar videos
  let dbResults: (Video & { similarity_score: number })[] = [];
  if (seedEmbeddings.length > 0) {
    const dbHits = await vectorSearch(seedEmbeddings[0], 10, unique.map((v) => v.video_id));
    dbResults = dbHits.map((h) => ({
      video_id: h.video_id,
      title: h.title,
      thumbnail: "",
      channel: "",
      channel_id: h.channel_id,
      description: "",
      tags: [],
      published_at: "",
      duration: "",
      view_count: 0,
      similarity_score: h.similarity,
    }));
  }

  const scored = [
    ...unique.map((video, i) => {
      const maxSim = Math.max(...seedEmbeddings.map((se) => cosineSimilarity(se, candidateEmbeddings[i])));
      return { ...video, similarity_score: maxSim };
    }),
    ...dbResults,
  ];

  const sorted = scored.sort((a, b) => b.similarity_score - a.similarity_score).slice(0, 20);
  const avgScore = sorted.reduce((s, v) => s + v.similarity_score, 0) / sorted.length;

  return {
    candidates: sorted,
    reasoning: finalReasoning,
    confidence: Math.min(avgScore + 0.1, 1),
    trace: buildTrace("content_analysis", startedAt, toolsCalled, sorted.length, Math.min(avgScore + 0.1, 1), finalReasoning),
  };
}

function buildTrace(
  agent: string,
  startedAt: string,
  toolsCalled: string[],
  outputCount: number,
  confidence: number,
  reasoning: string
): AgentTrace {
  const completedAt = new Date().toISOString();
  return {
    agent,
    started_at: startedAt,
    completed_at: completedAt,
    latency_ms: new Date(completedAt).getTime() - new Date(startedAt).getTime(),
    tools_called: toolsCalled,
    reasoning,
    output_count: outputCount,
    confidence,
  };
}
