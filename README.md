# SERENDEX

**Agentic YouTube Discovery Engine** — a multi-agent AI system that recommends videos the way a brilliant friend would, not just "similar to what you watched" but *reasoning about who you are, what you're missing, and what's rising right now.*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/serendex)
[![License: MIT](https://img.shields.io/badge/License-MIT-violet.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Powered by Claude](https://img.shields.io/badge/Powered%20by-Claude%20Sonnet-orange)](https://anthropic.com)

---

## Architecture

SERENDEX uses a **society of 6 specialized Claude agents** that run in parallel, collaborate, and self-correct:

```
User Request
    │
    ▼
ORCHESTRATOR AGENT (Claude Sonnet)
    │  reasons about user context, decides agent strategy
    │
    ├──────────────────┬──────────────────┐
    ▼                  ▼                  ▼
CONTENT ANALYSIS   USER PROFILING    TREND SCOUT
(embeddings +      (decaying interest (trending +
 pgvector ANN)      graph via Redis)   velocity score)
    │                  │                  │
    └──────────────────┴──────────────────┘
                       │
                       ▼
               DIVERSITY GUARD
               (prevents filter bubbles)
                       │
                       ▼
               EXPLANATION AGENT
               (natural language "why")
                       │
                       ▼
               15 ranked recommendations
               with full reasoning trace
```

| Agent | Model | Role |
|---|---|---|
| Orchestrator | Claude Sonnet 4.6 | Reasons about strategy, delegates, merges |
| Content Analysis | Claude Haiku 4.5 | Semantic similarity via YouTube API + pgvector |
| User Profiling | — | Decaying interest graph, Redis short/long-term memory |
| Trend Scout | — | Rising topics, view velocity scoring |
| Diversity Guard | — | Enforces channel/topic/format diversity |
| Explanation Agent | Claude Sonnet 4.6 | Personalized "why this was recommended" |

---

## Features

- **Parallel agent execution** — Content Analysis, User Profiling, and Trend Scout run concurrently
- **Cold start handling** — new users get trend-weighted recommendations automatically
- **Explainable by design** — every recommendation has a natural language reason
- **Agent Trace UI** — see every agent's reasoning chain live (great for demos)
- **pgvector ANN search** — embeddings persist and improve recommendations over time
- **Filter bubble prevention** — Diversity Guard enforces hard constraints
- **Vercel-native** — deploys in one click

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Agents | Anthropic Claude API (tool use) |
| Embeddings | Voyage AI `voyage-2` |
| Vector DB | Vercel Postgres + pgvector |
| Memory | Upstash Redis |
| Deployment | Vercel |

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/serendex.git
cd serendex
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in your keys:

| Variable | Where to get it |
|---|---|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `YOUTUBE_API_KEY` | [Google Cloud Console](https://console.cloud.google.com) → YouTube Data API v3 |
| `VOYAGE_API_KEY` | [voyageai.com](https://www.voyageai.com) — free 50M tokens |
| `UPSTASH_REDIS_REST_URL` | [upstash.com](https://upstash.com) → Create database → REST API |
| `UPSTASH_REDIS_REST_TOKEN` | Same as above |
| `POSTGRES_URL` | Vercel Dashboard → Storage → Create Postgres database |

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Initialize database schema

After starting, run once:

```bash
curl -X POST http://localhost:3000/api/setup
```

This creates the pgvector tables and IVFFlat index.

---

## Deploy to Vercel

### One-click deploy

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. In Vercel Dashboard → Storage:
   - Add **Postgres** database (enables pgvector)
   - Add **Upstash Redis** integration
4. Add remaining env vars: `ANTHROPIC_API_KEY`, `YOUTUBE_API_KEY`, `VOYAGE_API_KEY`
5. Deploy
6. Hit `POST https://your-app.vercel.app/api/setup` once to create tables

### Environment Variables on Vercel

```
ANTHROPIC_API_KEY        → Settings > Environment Variables
YOUTUBE_API_KEY          → Settings > Environment Variables
VOYAGE_API_KEY           → Settings > Environment Variables
UPSTASH_REDIS_REST_URL   → Auto-added by Upstash integration
UPSTASH_REDIS_REST_TOKEN → Auto-added by Upstash integration
POSTGRES_URL             → Auto-added by Vercel Postgres integration
```

---

## API Reference

### `GET /api/recommendations`

```
GET /api/recommendations?user_id=xyz&q=machine+learning&seed_video_id=abc
```

Returns 15 ranked video recommendations with agent reasoning traces.

### `POST /api/events`

```json
{
  "user_id": "string",
  "video_id": "string",
  "event_type": "click | watch | skip | like | dislike",
  "watch_duration_seconds": 120
}
```

Logs engagement signals that feed the User Profiling Agent.

### `POST /api/setup`

Run once after deployment to create pgvector schema.

---

## Project Structure

```
src/
├── agents/
│   ├── orchestrator.ts       # Coordinates all agents
│   ├── content-analysis.ts   # Embeddings + pgvector search
│   ├── user-profiling.ts     # Interest graph + Redis memory
│   ├── trend-scout.ts        # Trending + velocity scoring
│   ├── diversity-guard.ts    # Filter bubble prevention
│   └── explanation.ts        # Natural language reasoning
├── lib/
│   ├── db.ts                 # pgvector schema + queries
│   ├── embeddings.ts         # Voyage AI integration
│   ├── redis.ts              # User memory (Upstash)
│   └── youtube.ts            # YouTube Data API v3
├── app/
│   ├── page.tsx              # Landing + search
│   ├── feed/page.tsx         # Recommendations grid
│   └── api/                  # API routes
├── components/
│   ├── RecommendationCard.tsx # Video card + score bars
│   └── AgentTrace.tsx         # Reasoning trace UI
└── types/index.ts             # Shared TypeScript types
```

---

## Design Document

See [DESIGN.md](../DESIGN.md) for the full architecture design, agent specifications, interview explainability guide, and build roadmap.

---

## License

MIT — see [LICENSE](./LICENSE)
