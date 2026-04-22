import type { ScoredVideo, AgentTrace } from "@/types";

const CONSTRAINTS = {
  max_same_channel: 2,
  max_same_topic_cluster: 3,
  min_new_territory_ratio: 0.15,
  target_count: 15,
};

interface DiversityResult {
  final_list: ScoredVideo[];
  diversity_score: number;
  trace: AgentTrace;
}

export function runDiversityGuardAgent(candidates: ScoredVideo[]): DiversityResult {
  const startedAt = new Date().toISOString();

  const channelCounts: Record<string, number> = {};
  const final: ScoredVideo[] = [];
  let newTerritoryCount = 0;

  // Sort by final_score descending
  const sorted = [...candidates].sort((a, b) => b.scores.final_score - a.scores.final_score);

  for (const video of sorted) {
    if (final.length >= CONSTRAINTS.target_count) break;

    const channelCount = channelCounts[video.channel_id] ?? 0;
    if (channelCount >= CONSTRAINTS.max_same_channel) continue;

    channelCounts[video.channel_id] = channelCount + 1;

    if (video.explanation_type === "serendipitous") newTerritoryCount++;

    // Add diversity score to the video
    video.scores.diversity_score = computeVideoDiversityScore(video, final);
    final.push(video);
  }

  // Ensure minimum new territory
  const newTerritoryRatio = final.length > 0 ? newTerritoryCount / final.length : 0;
  if (newTerritoryRatio < CONSTRAINTS.min_new_territory_ratio && sorted.length > final.length) {
    const serendipitous = sorted.find(
      (v) => v.explanation_type === "serendipitous" && !final.find((f) => f.video_id === v.video_id)
    );
    if (serendipitous && final.length >= CONSTRAINTS.target_count) {
      final[final.length - 1] = serendipitous;
    }
  }

  const diversityScore = computeListDiversityScore(final);

  const completedAt = new Date().toISOString();
  const trace: AgentTrace = {
    agent: "diversity_guard",
    started_at: startedAt,
    completed_at: completedAt,
    latency_ms: new Date(completedAt).getTime() - new Date(startedAt).getTime(),
    tools_called: [],
    reasoning: `Enforced diversity constraints. Final list: ${final.length} videos, diversity score: ${diversityScore.toFixed(2)}. Channel distribution: ${JSON.stringify(channelCounts)}`,
    output_count: final.length,
    confidence: diversityScore,
  };

  return { final_list: final, diversity_score: diversityScore, trace };
}

function computeVideoDiversityScore(video: ScoredVideo, existing: ScoredVideo[]): number {
  if (existing.length === 0) return 1.0;
  const sameChannel = existing.filter((v) => v.channel_id === video.channel_id).length;
  const channelPenalty = sameChannel / CONSTRAINTS.max_same_channel;
  return Math.max(0, 1 - channelPenalty * 0.5);
}

function computeListDiversityScore(list: ScoredVideo[]): number {
  if (list.length === 0) return 0;

  const uniqueChannels = new Set(list.map((v) => v.channel_id)).size;
  const channelDiversity = Math.min(uniqueChannels / (list.length * 0.6), 1);

  const types = list.map((v) => v.explanation_type);
  const uniqueTypes = new Set(types).size;
  const typeDiversity = uniqueTypes / 5; // 5 possible types

  return (channelDiversity * 0.6 + typeDiversity * 0.4);
}
