@AGENTS.md

---
name: karpathy-guidelines
description: Behavioral guidelines to reduce common LLM coding mistakes. Use when writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria.
license: MIT
---

# Karpathy Guidelines

Behavioral guidelines to reduce common LLM coding mistakes, derived from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on LLM coding pitfalls.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

# Project: Serendex

Agentic YouTube discovery engine. A multi-agent AI system that recommends videos by reasoning about user interests, content similarity, and trending topics — not just watch history.

## Key Commands

```bash
npm run dev       # start dev server at localhost:3000
npm test          # run vitest (unit + integration)
npx tsc --noEmit  # type check without building
npm run build     # production build
```

## Architecture

Six agents run per recommendation request:

```
Orchestrator
  ├── Content Analysis  (embeddings + pgvector ANN search)
  ├── User Profiling    (decaying interest graph via Redis)
  └── Trend Scout       (view velocity scoring)
        └── Diversity Guard  (channel/topic diversity constraints)
              └── Explanation Agent  (natural language "why")
```

### File map

```
src/agents/
  orchestrator.ts       # coordinates agents, merges scores, caches result
  content-analysis.ts   # YouTube search + pgvector similarity
  user-profiling.ts     # Redis history → interest graph with real topic keys
  trend-scout.ts        # trending videos + rising topic extraction
  diversity-guard.ts    # enforces max 2 videos per channel, 15% serendipity
  explanation.ts        # LLM-generated per-video explanations

src/lib/
  youtube.ts            # YouTube Data API v3 — search, details, trending
  embeddings.ts         # Voyage AI embeddings + cosine similarity
  db.ts                 # Neon/pgvector — upsert + vector search (lazy singleton)
  redis.ts              # Upstash — user history, profiles, cache, rate limiting
  models.ts             # getModel() routes modelId → correct AI SDK provider
  models-list.ts        # single source of truth for all supported model IDs

src/app/api/
  recommendations/      # GET — validates model, rate limits, runs orchestrator
  events/               # POST — logs watch/click/like/skip/dislike events
  profile/              # GET — returns raw user profile for debugging
```

## Critical Constraints

### YouTube API Compliance
This project is under active YouTube API Services compliance review. Do not violate these:
- **III.C.1** — YouTube icon/branding must meet minimum size (≥ 24×24px). See `src/app/video/[id]/page.tsx`.
- **III.E.4h** — Never return blank or independently calculated data fields. Always fetch real data from the YouTube API. See `content-analysis.ts` — `getVideoDetails()` must be called before displaying any video.
- **III.F.2a,b** — Thumbnails must be at least 120×70px. Sidebar thumbnails use `w-32 min-h-[72px]`. Do not reduce these sizes.

### AI SDK — use `jsonSchema()`, not Zod
The Zod `toJsonSchema` conversion is broken in this version of the AI SDK. Always define tool parameters with `jsonSchema()`:
```ts
import { jsonSchema } from "ai";
parameters: jsonSchema({ type: "object", properties: { ... }, required: [...] })
```

### Multi-model system
- All supported models live in `src/lib/models-list.ts` — this is the single source of truth.
- `getModel(agent, modelId)` in `src/lib/models.ts` routes to the correct provider SDK.
- Never hardcode a provider or model string outside these two files.
- The `model` query param on `/api/recommendations` is validated against `MODELS` — add new models to `models-list.ts` first.

### YouTube quota fallback
- `searchYouTube()` falls back to `MOCK_VIDEOS` on 403.
- `getVideoDetails()` returns `[]` on 403.
- Never throw on quota exhaustion — the app must degrade gracefully.

### Rate limiting
`checkRateLimit(userId, 20, 60)` is enforced in the recommendations route (20 req/min per user). It uses Redis fixed-window. If Redis is unavailable, the limit is skipped — this is intentional.

## Data Flow

```
User watches video
  → POST /api/events  (logs WatchEvent to Redis)

User loads /video/[id]
  → VideoSidebar fetches GET /api/recommendations?seed_video_id=...
  → Orchestrator checks Redis cache (key includes userId + seedIds + modelId)
  → Cache miss: runs all 6 agents in parallel/sequence
  → User Profiling fetches video metadata to extract real topic keys
  → Content Analysis runs YouTube search + pgvector ANN
  → Scores merged, diversity enforced, explanations generated
  → Result cached in Redis for 1 hour
```

## Testing

Tests live in `src/test/` and alongside source files (`*.test.ts`). Run with `npm test`.
After any change, run `npx tsc --noEmit` and `npm test` before committing.
