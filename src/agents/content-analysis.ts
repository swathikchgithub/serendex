import { generateText, tool } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/models";
import { searchYouTube, getVideoDetails } from "@/lib/youtube";
import { embedTexts, videoToText, cosineSimilarity } from "@/lib/embeddings";
import { upsertVideoEmbedding, vectorSearch } from "@/lib/db";
import type { Video, AgentTrace } from "@/types";

interface ContentAgentResult {
  candidates: (Video & { similarity_score: number })[];
  reasoning: string;
  confidence: number;
  trace: AgentTrace;
}

export async function runContentAnalysisAgent(
  seedVideos: Video[],
  userTopics: string[],
  searchQuery = "",
  modelId = "gpt-4o-mini"
): Promise<ContentAgentResult> {
  const startedAt = new Date().toISOString();
  const toolsCalled: string[] = [];
  const allCandidates: Video[] = [];

  const query = [
    searchQuery,
    ...seedVideos.map((v) => v.title),
    ...userTopics,
  ].filter(Boolean).slice(0, 3).join(", ");

  const model = getModel("content", modelId);

  const isReasoningModel = modelId.toLowerCase().includes("r1");

  const result = await generateText({
    model,
    system: `You are the Content Analysis Agent for SERENDEX. Find 20 high-quality YouTube videos about: "${query}".
    Use search_youtube to find relevant content. Make 2-3 targeted searches with different angles (tutorials, deep dives, latest news) to maximize diversity.`,
    prompt: `Seed videos for reference: ${JSON.stringify(seedVideos.map((v) => ({ title: v.title, tags: v.tags })))}
    User's known topics: ${userTopics.join(", ") || "unknown"}.`,
    tools: isReasoningModel ? undefined : {
      search_youtube: tool({
        description: "Search YouTube for videos matching a query",
        parameters: z.object({
          query: z.string().describe("The search query string"),
          max_results: z.number().describe("The maximum number of results to return (default 20)")
        }),
        execute: async ({ query, max_results }: { query: string; max_results?: number }) => {
          toolsCalled.push(`search_youtube:${query}`);
          const results = await searchYouTube(query, max_results ?? 20);
          allCandidates.push(...results);
          return results.map((v) => ({ video_id: v.video_id, title: v.title, tags: v.tags }));
        },
      } as any),
      get_video_details: tool({
        description: "Get full details for specific video IDs",
        parameters: z.object({
          video_ids: z.array(z.string()).describe("A list of YouTube video IDs")
        }),
        execute: async ({ video_ids }: { video_ids: string[] }) => {
          toolsCalled.push(`get_video_details:${video_ids.length} videos`);
          const results = await getVideoDetails(video_ids);
          allCandidates.push(...results);
          return results.map((v) => ({ video_id: v.video_id, title: v.title, tags: v.tags }));
        },
      } as any),
    },
    maxSteps: isReasoningModel ? 1 : 5,
  } as any);

  // If it's a reasoning model, it won't have tool results, so we do a fallback search
  if (isReasoningModel && allCandidates.length === 0) {
    toolsCalled.push("reasoning_fallback_search");
    const fallbackResults = await searchYouTube(query, 20);
    allCandidates.push(...fallbackResults);
  }

  const finalReasoning = result.text;

  // Deduplicate candidates
  const unique = Array.from(new Map(allCandidates.map((v) => [v.video_id, v])).values());

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

  // Persist candidate embeddings to pgvector
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

  // Search pgvector index
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
