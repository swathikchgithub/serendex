import { runContentAnalysisAgent } from "./content-analysis";
import { runUserProfilingAgent } from "./user-profiling";
import { runTrendScoutAgent } from "./trend-scout";
import { runDiversityGuardAgent } from "./diversity-guard";
import { runExplanationAgent } from "./explanation";
import type { Video, ScoredVideo, RecommendationResponse } from "@/types";

import { getModel } from "@/lib/models";

interface OrchestratorInput {
  userId: string;
  seedVideos?: Video[];
  searchQuery?: string;
  modelId?: string;
}

export async function runOrchestrator(input: OrchestratorInput): Promise<RecommendationResponse> {
  const start = Date.now();
  const { userId, seedVideos = [], searchQuery = "", modelId = "gpt-4o-mini" } = input;

  // Step 1: Run profiling first to determine strategy (fast — Redis only)
  const profilingResult = await runUserProfilingAgent(userId);
  const { profile, top_topics, is_cold_start } = profilingResult;

  // Step 2: Determine agent weights based on user context
  const weights = is_cold_start
    ? { content: 0.6, profiling: 0.1, trend: 0.3 }
    : { content: 0.5, profiling: 0.3, trend: 0.2 };

  const orchestratorReasoning = is_cold_start
    ? `Cold start user detected. Running Content Analysis + Trend Scout with heavier content weighting (${weights.content}). Skipping deep user profiling.`
    : `Returning user with ${Object.keys(profile.interest_graph).length} known interests. Running all agents. Profiling weight: ${weights.profiling}. Topics: ${top_topics.join(", ")}.`;

  // Step 3: Run remaining agents in parallel
  const topicHints = [searchQuery, ...top_topics, ...seedVideos.map((v) => v.title.split(" ")[0])].filter(Boolean).slice(0, 3);

  const [contentResult, trendResult] = await Promise.all([
    runContentAnalysisAgent(seedVideos, top_topics, searchQuery, modelId),
    runTrendScoutAgent(topicHints),
  ]);

  // Step 4: Merge all candidates with weighted scoring
  const candidateMap = new Map<string, ScoredVideo>();

  const addCandidates = (
    videos: (Video & { similarity_score?: number; trend_score?: number })[],
    source: "content" | "trend"
  ) => {
    for (const video of videos) {
      const existing = candidateMap.get(video.video_id);
      const contentScore = source === "content" ? (video.similarity_score ?? 0) : 0;
      const trendScore = source === "trend" ? (video.trend_score ?? 0) : 0;

      if (existing) {
        existing.scores.content_similarity = Math.max(existing.scores.content_similarity, contentScore);
        existing.scores.trend_score = Math.max(existing.scores.trend_score, trendScore);
      } else {
        candidateMap.set(video.video_id, {
          ...video,
          scores: {
            content_similarity: contentScore,
            user_relevance: computeUserRelevance(video, profile.interest_graph),
            trend_score: trendScore,
            diversity_score: 0,
            final_score: 0,
          },
          explanation: "",
          explanation_type: "content_match",
        });
      }
    }
  };

  addCandidates(contentResult.candidates, "content");
  addCandidates(trendResult.trending_candidates, "trend");

  // Compute final weighted scores and tag explanation types
  const candidates: ScoredVideo[] = Array.from(candidateMap.values()).map((v) => {
    const finalScore =
      v.scores.content_similarity * weights.content +
      v.scores.user_relevance * weights.profiling +
      v.scores.trend_score * weights.trend;

    const explanationType = determineExplanationType(v.scores, weights);

    return { ...v, scores: { ...v.scores, final_score: finalScore }, explanation_type: explanationType };
  });

  // Step 5: Diversity Guard
  const { final_list, diversity_score, trace: diversityTrace } = runDiversityGuardAgent(candidates);

  // Step 6: Explanation Agent
  const { videos: explained, trace: explanationTrace } = await runExplanationAgent(
    final_list,
    profile,
    trendResult.rising_topics,
    modelId
  );

  return {
    recommendations: explained,
    meta: {
      agents_invoked: ["orchestrator", "content_analysis", "user_profiling", "trend_scout", "diversity_guard", "explanation"],
      total_latency_ms: Date.now() - start,
      orchestrator_reasoning: orchestratorReasoning,
      diversity_score,
      traces: [
        profilingResult.trace,
        contentResult.trace,
        trendResult.trace,
        diversityTrace,
        explanationTrace,
      ],
    },
  };
}

function computeUserRelevance(
  video: Video,
  interestGraph: Record<string, number>
): number {
  if (Object.keys(interestGraph).length === 0) return 0.3;

  const videoText = `${video.title} ${video.description} ${video.tags?.join(" ")}`.toLowerCase();
  let score = 0;
  let matches = 0;

  for (const [topic, weight] of Object.entries(interestGraph)) {
    if (videoText.includes(topic.replace(/_/g, " "))) {
      score += weight;
      matches++;
    }
  }

  return matches > 0 ? Math.min(score / matches, 1) : 0.1;
}

function determineExplanationType(
  scores: ScoredVideo["scores"],
  weights: { content: number; profiling: number; trend: number }
): ScoredVideo["explanation_type"] {
  const dominantSource = Object.entries({
    content_match: scores.content_similarity * weights.content,
    interest_evolution: scores.user_relevance * weights.profiling,
    trending: scores.trend_score * weights.trend,
  }).sort(([, a], [, b]) => b - a)[0][0];

  if (dominantSource === "content_match" && scores.content_similarity > 0.8) return "content_match";
  if (dominantSource === "interest_evolution" && scores.user_relevance > 0.7) return "interest_evolution";
  if (dominantSource === "trending" && scores.trend_score > 0.5) return "trending";
  if (scores.user_relevance < 0.2 && scores.content_similarity < 0.5) return "serendipitous";
  return "social_proof";
}
