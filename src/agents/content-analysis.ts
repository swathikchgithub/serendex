import { generateText, jsonSchema } from "ai";
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
  const isReasoningModel = modelId.toLowerCase().includes("r1") || modelId.toLowerCase().includes("reasoner");

  // Use jsonSchema() wrapper — this is the correct AI SDK v6 way to pass
  // raw JSON schemas, bypassing the broken Zod toJsonSchema conversion.
  const searchTool = {
    description: "Search YouTube for videos matching a query",
    parameters: jsonSchema({
      type: "object" as const,
      properties: {
        query: { type: "string", description: "The search query string" },
        max_results: { type: "number", description: "Max results (default 20)" }
      },
      required: ["query"],
      additionalProperties: false,
    }),
    execute: async ({ query, max_results }: { query: string; max_results?: number }) => {
      toolsCalled.push(`search_youtube:${query}`);
      const results = await searchYouTube(query, max_results ?? 20);
      allCandidates.push(...results);
      return results.map((v) => ({ video_id: v.video_id, title: v.title, tags: v.tags }));
    },
  };

  const detailsTool = {
    description: "Get full details for specific video IDs",
    parameters: jsonSchema({
      type: "object" as const,
      properties: {
        video_ids: {
          type: "array",
          items: { type: "string" },
          description: "A list of YouTube video IDs"
        }
      },
      required: ["video_ids"],
      additionalProperties: false,
    }),
    execute: async ({ video_ids }: { video_ids: string[] }) => {
      toolsCalled.push(`get_video_details:${video_ids.length} videos`);
      const results = await getVideoDetails(video_ids);
      allCandidates.push(...results);
      return results.map((v) => ({ video_id: v.video_id, title: v.title, tags: v.tags }));
    },
  };

  let finalReasoning = "";

  try {
    const { text } = await generateText({
      model,
      system: `You are the Content Analysis Agent for SERENDEX. Your goal is to find 20 high-quality YouTube videos about: "${query}".
      
      You must formulate 2-3 targeted YouTube search queries with different angles (e.g., tutorials, deep dives, latest news) to maximize diversity.
      
      CRITICAL: You must output ONLY a valid JSON array of strings containing your search queries. Do not output any markdown formatting, backticks, or other text.
      Example: ["artificial intelligence tutorial 2026", "AI deep dive explanation", "latest news in machine learning"]`,
      prompt: `Seed videos for reference: ${JSON.stringify(seedVideos.map((v) => ({ title: v.title, tags: v.tags })))}
      User's known topics: ${userTopics.join(", ") || "unknown"}.
      
      Output your JSON array of search queries now:`,
    });
    
    finalReasoning = "Generated search queries based on user intent.";
    
    // Parse the JSON array of queries
    let queriesToRun: string[] = [];
    try {
      // Clean up potential markdown formatting if the model ignored instructions
      const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      queriesToRun = JSON.parse(cleanedText);
      if (!Array.isArray(queriesToRun)) queriesToRun = [query];
    } catch (parseErr) {
      console.error("[content-agent] Failed to parse queries:", text);
      queriesToRun = [query]; // fallback to main query
    }

    // Execute the searches manually
    for (const q of queriesToRun.slice(0, 3)) { // max 3 queries to avoid rate limits
      toolsCalled.push(`search_youtube:${q}`);
      const results = await searchYouTube(q, 10);
      allCandidates.push(...results);
    }

  } catch (err: any) {
    console.error("[content-agent] Error during generateText:", err.message);
    finalReasoning = `Search initiated for: ${query}. (Model fallback used)`;
  }

  // Fallback search if no candidates were found
  if (allCandidates.length === 0) {
    toolsCalled.push("fallback_search");
    const fallbackResults = await searchYouTube(query, 20);
    allCandidates.push(...fallbackResults);
  }

  // Deduplicate candidates
  const unique = Array.from(new Map(allCandidates.map((v) => [v.video_id, v])).values());

  if (unique.length === 0) {
    return {
      candidates: [],
      reasoning: finalReasoning || `Searched for: ${query}`,
      confidence: 0.3,
      trace: buildTrace("content_analysis", startedAt, toolsCalled, 0, 0.3, finalReasoning),
    };
  }

  // If no seed videos, we can't do vector similarity against previous watches,
  // so we treat the initial search results as highly relevant (score 0.8)
  if (seedVideos.length === 0) {
    const scored = unique.map((v) => ({ ...v, similarity_score: 0.8 }));
    return {
      candidates: scored,
      reasoning: finalReasoning + " (Cold start: utilizing initial search results as baseline)",
      confidence: 0.5,
      trace: buildTrace("content_analysis", startedAt, toolsCalled, scored.length, 0.5, finalReasoning),
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
    if (dbHits.length > 0) {
      const hitDetails = await getVideoDetails(dbHits.map((h) => h.video_id));
      dbResults = hitDetails.map((video) => {
        const hit = dbHits.find((h) => h.video_id === video.video_id);
        return {
          ...video,
          similarity_score: hit ? hit.similarity : 0,
        };
      });
    }
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
