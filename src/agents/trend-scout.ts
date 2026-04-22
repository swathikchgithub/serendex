import { getTrendingVideos, searchYouTube } from "@/lib/youtube";
import type { Video, AgentTrace } from "@/types";

interface TrendResult {
  trending_candidates: (Video & { trend_score: number })[];
  rising_topics: string[];
  confidence: number;
  trace: AgentTrace;
}

export async function runTrendScoutAgent(topicHints: string[]): Promise<TrendResult> {
  const startedAt = new Date().toISOString();
  const toolsCalled: string[] = [];

  // Fetch trending + topic-based recent uploads in parallel
  const fetches: Promise<Video[]>[] = [getTrendingVideos()];
  toolsCalled.push("get_trending_videos");

  for (const topic of topicHints.slice(0, 2)) {
    fetches.push(
      searchYouTube(`${topic} 2025`, 10).then((videos) => {
        toolsCalled.push(`search_youtube:${topic}`);
        return videos;
      })
    );
  }

  const results = await Promise.all(fetches);
  const allVideos = results.flat();
  const unique = Array.from(new Map(allVideos.map((v) => [v.video_id, v])).values());

  // Score by recency × view velocity (simplified)
  const scored = unique.map((video) => {
    const daysSincePublish = Math.max(
      1,
      (Date.now() - new Date(video.published_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    const recencyBoost = 1 + 1 / daysSincePublish;
    const trendScore = Math.min((video.view_count / 1_000_000) * recencyBoost, 1);
    return { ...video, trend_score: trendScore };
  });

  const sorted = scored.sort((a, b) => b.trend_score - a.trend_score).slice(0, 10);

  // Extract rising topics from top trending titles (simple keyword extraction)
  const risingTopics = extractTopics(sorted.slice(0, 5).map((v) => v.title));

  const confidence = sorted.length > 5 ? 0.75 : 0.5;

  return {
    trending_candidates: sorted,
    rising_topics: risingTopics,
    confidence,
    trace: buildTrace(startedAt, toolsCalled, sorted.length, confidence,
      `Found ${sorted.length} trending candidates. Rising topics: ${risingTopics.join(", ")}`),
  };
}

function extractTopics(titles: string[]): string[] {
  const stopwords = new Set(["the", "a", "an", "is", "in", "on", "how", "why", "what", "i", "my", "you", "your"]);
  const wordCounts: Record<string, number> = {};

  for (const title of titles) {
    const words = title.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(" ");
    for (const word of words) {
      if (word.length > 3 && !stopwords.has(word)) {
        wordCounts[word] = (wordCounts[word] ?? 0) + 1;
      }
    }
  }

  return Object.entries(wordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

function buildTrace(
  startedAt: string,
  toolsCalled: string[],
  outputCount: number,
  confidence: number,
  reasoning: string
): AgentTrace {
  const completedAt = new Date().toISOString();
  return {
    agent: "trend_scout",
    started_at: startedAt,
    completed_at: completedAt,
    latency_ms: new Date(completedAt).getTime() - new Date(startedAt).getTime(),
    tools_called: toolsCalled,
    reasoning,
    output_count: outputCount,
    confidence,
  };
}
