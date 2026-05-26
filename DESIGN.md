# SERENDEX
### Serendipitous Discovery Engine — Agentic YouTube Recommendation System

> *"The best recommendation is the one you didn't know you needed."*

---

## Codename: SERENDEX

**S**emantics · **E**mbeddings · **R**easoning · **E**ngagement · **N**eural · **D**iscovery · **EX**ploration

Unique, not taken, hints at *serendipity* (unexpected discovery) + *index* (search/ranking). That's exactly what great recommendations feel like.

---

## Table of Contents

1. [Vision](#1-vision)
2. [Problem Statement](#2-problem-statement)
3. [Agentic Architecture](#3-agentic-architecture)
4. [Agent Specifications](#4-agent-specifications)
5. [Data Flow](#5-data-flow)
6. [Tech Stack](#6-tech-stack)
7. [API Design](#7-api-design)
8. [Database Schema](#8-database-schema)
9. [Frontend Design](#9-frontend-design)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Interview Explainability Guide](#11-interview-explainability-guide)
12. [Build Roadmap](#12-build-roadmap)

---

## 1. Vision

SERENDEX is a **multi-agent AI system** that recommends YouTube videos the way a brilliant friend would — not just "similar to what you watched" but *reasoning about who you are, what you're missing, and what's culturally relevant right now.*

Unlike traditional recommendation pipelines (static models, batch updates), SERENDEX is a **living society of agents** that collaborate, debate, and self-correct in real time.

---

## 2. Problem Statement

| Problem | Traditional System | SERENDEX Approach |
|---|---|---|
| Cold start | Fails for new users | Orchestrator routes to Trend Scout first |
| Filter bubbles | Amplifies existing interests | Diversity Guard audits every result set |
| Staleness | Batch retraining (hours/days) | Trend Scout polls in near real-time |
| Black box | No explanation possible | Explanation Agent narrates every decision |
| Single failure point | One model fails = bad results | Agents retry, fallback, re-delegate |

---

## 3. Agentic Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SERENDEX RUNTIME                            │
│                                                                     │
│   User Request                                                      │
│       │                                                             │
│       ▼                                                             │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                  ORCHESTRATOR AGENT                         │    │
│  │              (Claude Sonnet — Tool Use)                     │    │
│  │                                                             │    │
│  │  - Reads user context                                       │    │
│  │  - Decides which agents to invoke & in what order          │    │
│  │  - Handles agent failures with retry/fallback logic        │    │
│  │  - Merges results + triggers quality checks                │    │
│  └─────┬──────────────┬────────────────────┬──────────────────┘    │
│        │              │                    │                        │
│   (parallel)     (parallel)           (parallel)                   │
│        ▼              ▼                    ▼                        │
│  ┌──────────┐  ┌─────────────┐  ┌──────────────────┐              │
│  │ CONTENT  │  │    USER     │  │     TREND        │              │
│  │ ANALYSIS │  │  PROFILING  │  │     SCOUT        │              │
│  │  AGENT   │  │    AGENT    │  │     AGENT        │              │
│  └────┬─────┘  └──────┬──────┘  └────────┬─────────┘              │
│       │               │                  │                         │
│       └───────────────┴──────────────────┘                         │
│                              │                                      │
│                              ▼                                      │
│                  ┌───────────────────────┐                         │
│                  │   DIVERSITY GUARD     │                         │
│                  │       AGENT           │                         │
│                  └───────────┬───────────┘                         │
│                              │                                      │
│                              ▼                                      │
│                  ┌───────────────────────┐                         │
│                  │   EXPLANATION AGENT   │                         │
│                  └───────────┬───────────┘                         │
│                              │                                      │
│                              ▼                                      │
│                    Final Ranked List + Reasoning                    │
└─────────────────────────────────────────────────────────────────────┘
```

### Agent Interaction Principles

1. **Parallel by default** — Content Analysis, User Profiling, and Trend Scout run concurrently
2. **Sequential where dependent** — Diversity Guard and Explanation Agent run after all three complete
3. **Retry with backoff** — Each agent has a 3-attempt retry with exponential backoff
4. **Confidence thresholds** — Orchestrator re-delegates if an agent's confidence score < 0.6
5. **Short-circuit on quality** — If Content Analysis returns high-confidence results (>0.85), Orchestrator can skip Trend Scout for latency savings

---

## 4. Agent Specifications

### 4.1 Orchestrator Agent

**Role:** The brain. Coordinates all agents, reasons about the user's context, decides the optimal agent activation strategy.

**Model:** `claude-sonnet-4-6` with tool use enabled

**Tools available:**
- `invoke_content_agent(query, video_seed_ids)`
- `invoke_profiling_agent(user_id)`
- `invoke_trend_agent(topic_hints)`
- `invoke_diversity_guard(candidate_list)`
- `invoke_explanation_agent(final_list, reasoning_logs)`
- `get_user_context(user_id)` — reads session + history

**Decision logic (pseudo):**
```
if user.is_new:
    run [trend_scout, content_analysis] in parallel
    skip user_profiling (no data yet)
else if user.session_length > 5:
    run all three agents in parallel
    weight user_profiling higher (0.5)
else:
    run [content_analysis, user_profiling] in parallel
    skip trend_scout (save latency)
```

**System prompt excerpt:**
```
You are the Orchestrator of SERENDEX, an agentic recommendation engine.
Your job is to reason about the user's context and delegate to the right
specialist agents. You are not a router — you REASON about which agents
to invoke, in what order, and how to weight their outputs.
Always explain your delegation decisions in your reasoning trace.
```

---

### 4.2 Content Analysis Agent

**Role:** Understands the semantic meaning of videos. Finds what's *like* something, not just what's tagged the same.

**Model:** `claude-haiku-4-5` (fast, cheap — runs many comparisons)

**Tools available:**
- `search_youtube(query, max_results)` — YouTube Data API v3
- `get_video_details(video_ids[])` — title, description, tags, duration, channel
- `embed_text(texts[])` — generates vector embeddings (Voyage AI)
- `vector_search(embedding, top_k)` — cosine similarity search in pgvector

**What it produces:**
```json
{
  "agent": "content_analysis",
  "candidates": [
    {
      "video_id": "abc123",
      "title": "...",
      "similarity_score": 0.92,
      "semantic_topics": ["machine learning", "neural networks"],
      "confidence": 0.88
    }
  ],
  "reasoning": "Found strong semantic overlap on transformer architecture topic cluster"
}
```

**Algorithm:**
1. Take seed video(s) from user's recent history
2. Embed their title + description + tags → 1536-dim vector
3. Search pgvector index for top-50 nearest neighbors
4. Re-rank by freshness × similarity
5. Return top-20 with confidence scores

---

### 4.3 User Profiling Agent

**Role:** Builds and maintains a dynamic interest graph. Knows what you care about *right now*, not just historically.

**Model:** `claude-haiku-4-5`

**Tools available:**
- `get_user_history(user_id, limit)` — recent watch/click events from Redis
- `get_user_long_term_profile(user_id)` — persistent interest graph from Postgres
- `update_interest_graph(user_id, new_signals)` — writes back updated weights
- `cluster_interests(video_list)` — groups videos into topic clusters

**Memory model:**
```
Short-term memory (Redis, TTL: 24h):
  - Last 20 watched videos
  - Current session clicks
  - Recency-weighted topic scores

Long-term memory (Postgres, persistent):
  - Interest graph: {topic: weight} with exponential decay
  - Channel preferences
  - Format preferences (shorts vs long-form vs tutorials)
  - Negative signals (skipped, disliked)
```

**Interest decay formula:**
```
weight(t) = weight(t-1) × e^(-λ × days_since_interaction)
where λ = 0.1 (slow decay — interests fade over ~10 days)
```

**What it produces:**
```json
{
  "agent": "user_profiling",
  "user_vector": { "machine_learning": 0.9, "startups": 0.6, "cooking": 0.1 },
  "preferred_channels": ["3Blue1Brown", "Lex Fridman"],
  "format_preference": "long-form",
  "cold_start": false,
  "confidence": 0.82
}
```

---

### 4.4 Trend Scout Agent

**Role:** Finds what's *rising* before it peaks. Injects cultural freshness into recommendations.

**Model:** `claude-haiku-4-5`

**Tools available:**
- `get_trending_videos(region, category)` — YouTube trending API
- `search_youtube_by_date(query, published_after)` — recent uploads on user topics
- `get_video_velocity(video_id)` — views/hour growth rate (computed metric)

**Trend scoring:**
```
trend_score = (views_last_24h / total_views) × recency_boost
recency_boost = 1 + (1 / days_since_publish)  // newer = higher boost
```

**What it produces:**
```json
{
  "agent": "trend_scout",
  "trending_candidates": [...],
  "rising_topics": ["quantum computing", "vibe coding"],
  "confidence": 0.74
}
```

---

### 4.5 Diversity Guard Agent

**Role:** Acts as a critic. Audits the merged candidate list and enforces diversity constraints. Prevents the system from recommending 10 videos from the same channel.

**Model:** `claude-haiku-4-5`

**Diversity constraints enforced:**
```
max_same_channel: 2        // no channel monopoly
max_same_topic_cluster: 3  // topic variety
min_format_variety: 2      // mix shorts/long-form
min_new_territory: 0.15    // 15% must be outside known interests
```

**What it does:**
1. Receives merged list of ~60 candidates
2. Scores diversity across channel, topic, format, novelty dimensions
3. If diversity_score < 0.7, re-ranks by penalizing redundant items
4. Returns final 15 recommendations with diversity metadata

**Loop condition (Orchestrator re-invokes if):**
```
diversity_score < 0.6 → Orchestrator injects more Trend Scout results and retries
```

---

### 4.6 Explanation Agent

**Role:** Makes SERENDEX trustworthy and transparent. Generates a human-readable "why" for each recommendation.

**Model:** `claude-sonnet-4-6` (needs nuanced language)

**Input:** Final 15 videos + all agent reasoning logs

**Output per video:**
```json
{
  "video_id": "abc123",
  "explanation": "Recommended because you watched 3 videos on transformer architecture this week, and this deep-dive by Andrej Karpathy covers the same topic from a practical angle you haven't explored yet.",
  "explanation_type": "content_match + novelty",
  "agent_sources": ["content_analysis", "user_profiling"]
}
```

**Explanation types:**
- `content_match` — "Similar to what you watched"
- `interest_evolution` — "You've been exploring X, this goes deeper"
- `trending_in_your_field` — "Rising fast in topics you care about"
- `serendipitous` — "Outside your usual topics but highly relevant to your work"
- `social_proof` — "Popular among viewers with similar taste"

---

## 5. Data Flow

```
1. User opens SERENDEX app
   └── GET /api/recommendations?user_id=xyz

2. API Route → invokes Orchestrator Agent
   └── Orchestrator reads user context from Redis

3. Orchestrator delegates (parallel):
   ├── Content Analysis Agent
   │     └── YouTube API → embed → pgvector search → top 20
   ├── User Profiling Agent
   │     └── Redis (short-term) + Postgres (long-term) → interest graph
   └── Trend Scout Agent
         └── YouTube Trending API → velocity scoring → top 10

4. Orchestrator merges results (60 candidates total)
   └── Weighted merge: 0.5 content + 0.3 profiling + 0.2 trend

5. Diversity Guard audits merged list
   └── Re-ranks to enforce diversity constraints → 15 finalists

6. Explanation Agent generates per-video reasoning
   └── Returns natural language explanations

7. API returns structured response to frontend
   └── Frontend renders recommendations + explanations

8. User interaction (click/watch/skip) → logged to Redis
   └── Async: User Profiling Agent updates interest graph
```

---

## 6. Tech Stack

### Runtime
| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 14 App Router | Vercel-native, server components, API routes |
| Language | TypeScript | Type safety across agent contracts |
| AI Agents | Anthropic Claude API (tool use) | Native multi-step reasoning |
| Embeddings | Voyage AI `voyage-2` | Best-in-class semantic embeddings |

### Data
| Layer | Technology | Why |
|---|---|---|
| Vector DB | Vercel Postgres + pgvector | Free tier, zero config, SQL+vector in one |
| Short-term memory | Upstash Redis | Vercel integration, serverless-friendly |
| Video metadata cache | Vercel KV | Fast lookups, edge-cached |

### External APIs
| API | Usage | Free Tier |
|---|---|---|
| YouTube Data API v3 | Video search, metadata, trending | 10,000 units/day |
| Anthropic API | All 5 agents | Pay per token |
| Voyage AI | Embeddings | 50M tokens free |

### Observability
| Tool | Usage |
|---|---|
| Vercel Analytics | Frontend performance |
| Custom agent trace logs | Stored in Postgres `agent_traces` table |
| LangSmith (optional) | Agent run visualization |

---

## 7. API Design

### `GET /api/recommendations`
```typescript
// Request
GET /api/recommendations?user_id=xyz&seed_video_id=abc&limit=15

// Response
{
  "recommendations": [
    {
      "video_id": "string",
      "title": "string",
      "thumbnail": "string",
      "channel": "string",
      "duration": "string",
      "view_count": number,
      "published_at": "string",
      "scores": {
        "content_similarity": 0.88,
        "user_relevance": 0.75,
        "trend_score": 0.42,
        "diversity_score": 0.91,
        "final_score": 0.79
      },
      "explanation": "string",
      "explanation_type": "content_match | interest_evolution | trending | serendipitous"
    }
  ],
  "meta": {
    "agents_invoked": ["orchestrator", "content_analysis", "user_profiling", "trend_scout", "diversity_guard", "explanation"],
    "total_latency_ms": 1840,
    "orchestrator_reasoning": "string",
    "diversity_score": 0.84
  }
}
```

### `POST /api/events`
```typescript
// Log user interaction
{
  "user_id": "string",
  "video_id": "string",
  "event_type": "click | watch | skip | like | dislike",
  "watch_duration_seconds": number,
  "timestamp": "string"
}
```

### `GET /api/agent-trace/:session_id`
```typescript
// For the "show your reasoning" feature
{
  "session_id": "string",
  "agents": [
    {
      "agent": "content_analysis",
      "started_at": "string",
      "completed_at": "string",
      "tools_called": [...],
      "reasoning": "string",
      "output_count": 20
    }
  ]
}
```

---

## 8. Database Schema

```sql
-- Video embeddings (pgvector)
CREATE TABLE video_embeddings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id    TEXT UNIQUE NOT NULL,
  title       TEXT,
  description TEXT,
  tags        TEXT[],
  channel_id  TEXT,
  embedding   vector(1536),       -- Voyage AI embedding
  topics      TEXT[],             -- extracted topic clusters
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON video_embeddings USING ivfflat (embedding vector_cosine_ops);

-- User long-term interest profiles
CREATE TABLE user_profiles (
  user_id         TEXT PRIMARY KEY,
  interest_graph  JSONB,          -- { topic: weight }
  channel_prefs   JSONB,          -- { channel_id: weight }
  format_prefs    JSONB,          -- { shorts: 0.3, long: 0.7 }
  negative_signals TEXT[],        -- skipped/disliked video_ids
  last_updated    TIMESTAMPTZ DEFAULT now()
);

-- Agent reasoning traces (for transparency UI)
CREATE TABLE agent_traces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  TEXT NOT NULL,
  agent_name  TEXT NOT NULL,
  input       JSONB,
  output      JSONB,
  reasoning   TEXT,
  latency_ms  INTEGER,
  confidence  FLOAT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Watch events (async fed to User Profiling Agent)
CREATE TABLE watch_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL,
  video_id        TEXT NOT NULL,
  event_type      TEXT NOT NULL,  -- click, watch, skip, like, dislike
  watch_duration  INTEGER,        -- seconds
  created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON watch_events (user_id, created_at DESC);
```

---

## 9. Frontend Design

### Pages
```
/                   → Landing + search bar
/feed               → Main recommendations grid
/video/:id          → Video player page + sidebar recommendations
/profile            → User interest graph visualization
/trace/:session_id  → Agent reasoning transparency view (interview showpiece)
```

### Key UI Components

**Recommendation Card:**
```
┌─────────────────────────────────────────┐
│  [Thumbnail]                            │
│  Title of the video                     │
│  Channel Name · 1.2M views · 3 days ago │
│                                         │
│  💡 "Recommended because you've been   │
│      exploring transformer architecture │
│      — this goes deeper on attention"  │
│                                         │
│  [Content Match 88%] [Trending ↑]      │
└─────────────────────────────────────────┘
```

**Agent Trace View (Interview Showpiece):**
```
SERENDEX Reasoning Trace
─────────────────────────
🧠 Orchestrator (42ms)
   "User has 14 days history, invoking all 3 agents in parallel.
    Weighting user_profiling higher (0.5) due to rich history."

⚡ Content Analysis (380ms)     ✓ 20 candidates
   Tools: search_youtube → embed_text → vector_search
   "Found strong cluster around ML education content"

👤 User Profiling (120ms)       ✓ Interest graph loaded
   "Top interests: ML (0.9), startups (0.6). Prefers long-form."

📈 Trend Scout (290ms)          ✓ 10 trending candidates
   "Detected rising topic: vibe coding — relevant to user"

🛡️ Diversity Guard (85ms)       ✓ Score: 0.84
   "Penalized 3 duplicate 3Blue1Brown videos. Injected 2 novel picks."

💬 Explanation Agent (340ms)    ✓ 15 explanations generated
─────────────────────────────────────────
Total: 1,257ms
```

---

## 10. Deployment Architecture

```
                     Vercel Edge Network
                            │
              ┌─────────────┴─────────────┐
              │                           │
         Static Assets              API Routes
         (Next.js SSG)          (Serverless Functions)
                                         │
                         ┌───────────────┼───────────────┐
                         │               │               │
                    Anthropic        Upstash         Vercel
                    Claude API        Redis          Postgres
                    (agents)      (short-term      (pgvector
                                   memory)         embeddings)
                                                        │
                                                   Vercel KV
                                                (metadata cache)
```

### Environment Variables
```bash
ANTHROPIC_API_KEY=
YOUTUBE_API_KEY=
VOYAGE_API_KEY=
POSTGRES_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

---

## 11. Interview Explainability Guide

### "Walk me through your architecture"
> *SERENDEX uses a multi-agent architecture with 5 specialized Claude agents coordinated by an Orchestrator. Content Analysis handles semantic similarity via embeddings, User Profiling maintains a decaying interest graph, Trend Scout injects freshness signals, Diversity Guard prevents filter bubbles, and an Explanation Agent makes every recommendation transparent. The Orchestrator reasons — not just routes — deciding which agents to invoke based on user context.*

### "How do you handle cold start?"
> *New users have no history, so User Profiling Agent is skipped entirely. The Orchestrator routes to Trend Scout and Content Analysis only. As the user interacts, User Profiling Agent activates incrementally, increasing its weight in the merge formula.*

### "How does it scale?"
> *Each agent is a stateless serverless function. State lives in Redis (ephemeral) and Postgres (persistent). The pgvector index uses IVFFlat approximate nearest neighbors — handles millions of embeddings with sub-100ms query time. We can scale agents independently based on load.*

### "Why agents instead of a single model?"
> *Separation of concerns at the reasoning level. Each agent can fail and retry independently. You can swap out the algorithm for one agent without touching others. And critically — you get explainability for free, because each agent logs its reasoning chain.*

### "What's your latency story?"
> *P50 is ~1.2s. The three main agents run in parallel so we pay the cost of the slowest, not the sum. For returning users with a warm Redis cache, User Profiling completes in <100ms. We short-circuit Trend Scout if Content Analysis returns high-confidence results.*

### "How do you prevent filter bubbles?"
> *Diversity Guard is an explicit architectural component, not an afterthought. It enforces hard constraints: max 2 videos per channel, at least 15% of results must come from outside the user's known interest clusters. It's the critic in the society of agents.*

---

## 12. Build Roadmap

### Phase 1 — Foundation (Week 1)
- [ ] Next.js 14 project setup with TypeScript
- [ ] YouTube Data API integration + search endpoint
- [ ] Voyage AI embedding pipeline
- [ ] pgvector setup on Vercel Postgres
- [ ] Content Analysis Agent (basic tool use)
- [ ] Simple UI: search → recommendations grid

### Phase 2 — Agents Come Alive (Week 2)
- [ ] Orchestrator Agent with decision logic
- [ ] User Profiling Agent + Redis memory
- [ ] Watch event logging pipeline
- [ ] Trend Scout Agent
- [ ] Merge algorithm with weighted scores

### Phase 3 — Quality & Transparency (Week 3)
- [ ] Diversity Guard Agent
- [ ] Explanation Agent
- [ ] Agent Trace UI (the interview showpiece)
- [ ] User interest graph visualization
- [ ] Cold start handling

### Phase 4 — Polish & Deploy (Week 4)
- [ ] Performance optimization (parallel agents, caching)
- [ ] Error handling + agent fallbacks
- [ ] Vercel deployment with all env vars
- [ ] Demo video walkthrough
- [ ] This design doc → GitHub README

---

## Appendix: Why "SERENDEX"?

| Letter | Meaning |
|---|---|
| **S**erendipity | The best recommendations feel like happy accidents |
| **E**mbeddings | The semantic foundation of understanding |
| **R**easoning | Agents reason, they don't just pattern-match |
| **E**ngagement | Signals that shape the interest graph |
| **N**eural | Embedding space is fundamentally neural |
| **D**iscovery | The end goal — finding what you didn't know you needed |
| **EX** | Explainable — every recommendation has a "why" |

---

*SERENDEX — Built to explain itself.*
