import { getUserHistory, getUserProfile, saveUserProfile } from "@/lib/redis";
import { getVideoDetails } from "@/lib/youtube";
import type { UserProfile, Video, WatchEvent, AgentTrace } from "@/types";

interface ProfilingResult {
  profile: UserProfile;
  top_topics: string[];
  is_cold_start: boolean;
  confidence: number;
  trace: AgentTrace;
}

export async function runUserProfilingAgent(userId: string): Promise<ProfilingResult> {
  const startedAt = new Date().toISOString();

  // Gracefully handle missing Redis config (e.g. env vars not yet set)
  let history: WatchEvent[] = [];
  let existingProfile: UserProfile | null = null;
  try {
    [history, existingProfile] = await Promise.all([
      getUserHistory(userId, 20),
      getUserProfile(userId),
    ]);
  } catch {
    return {
      profile: coldStartProfile(userId),
      top_topics: [],
      is_cold_start: true,
      confidence: 0.1,
      trace: buildTrace(startedAt, [], 0, 0.1, "Redis unavailable — falling back to cold start"),
    };
  }

  const isColdStart = history.length < 3;

  if (isColdStart) {
    return {
      profile: coldStartProfile(userId),
      top_topics: [],
      is_cold_start: true,
      confidence: 0.1,
      trace: buildTrace(startedAt, ["get_user_history"], 0, 0.1, "Cold start — insufficient history"),
    };
  }

  // Fetch video metadata for history so we can extract real topics (all hits cached)
  const uniqueVideoIds = [...new Set(history.map((e) => e.video_id))];
  let videoMetaMap = new Map<string, Video>();
  try {
    const videos = await getVideoDetails(uniqueVideoIds);
    videoMetaMap = new Map(videos.map((v) => [v.video_id, v]));
  } catch {
    // Metadata unavailable — profile will fall back to video-ID proxy keys
  }

  // Build interest graph from watch history
  const profile = existingProfile ?? {
    user_id: userId,
    interest_graph: {},
    channel_prefs: {},
    format_prefs: { shorts: 0, long_form: 0, tutorials: 0 },
    negative_signals: [],
    last_updated: new Date().toISOString(),
  };

  // Apply exponential decay to existing weights
  const decayFactor = 0.95;
  for (const topic in profile.interest_graph) {
    profile.interest_graph[topic] *= decayFactor;
    if (profile.interest_graph[topic] < 0.01) delete profile.interest_graph[topic];
  }

  // Process new events with real video metadata
  for (const event of history) {
    const videoMeta = videoMetaMap.get(event.video_id);
    updateProfileFromEvent(profile, event, videoMeta);
  }

  profile.last_updated = new Date().toISOString();
  await saveUserProfile(profile);

  const topTopics = Object.entries(profile.interest_graph)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([topic]) => topic);

  const confidence = Math.min(0.4 + history.length * 0.03, 0.95);

  return {
    profile,
    top_topics: topTopics,
    is_cold_start: false,
    confidence,
    trace: buildTrace(
      startedAt,
      ["get_user_history", "get_user_profile", "get_video_details", "save_user_profile"],
      history.length,
      confidence,
      `Processed ${history.length} events. Top interests: ${topTopics.join(", ")}`
    ),
  };
}

const TOPIC_STOPWORDS = new Set([
  "the", "a", "an", "is", "in", "on", "how", "why", "what", "with",
  "for", "of", "to", "and", "or", "my", "your", "this", "that",
]);

function extractTopicsFromVideo(video: Video): string[] {
  // Tags are the best signal — normalise and use them directly
  const fromTags = video.tags
    .slice(0, 5)
    .map((t) => t.toLowerCase().replace(/\s+/g, "_"));

  if (fromTags.length > 0) return fromTags;

  // Fall back to significant words in the title
  const fromTitle = video.title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .split(" ")
    .filter((w) => w.length > 3 && !TOPIC_STOPWORDS.has(w))
    .slice(0, 3);

  return fromTitle.length > 0 ? fromTitle : [`video_${video.video_id.slice(0, 8)}`];
}

function updateProfileFromEvent(profile: UserProfile, event: WatchEvent, videoMeta?: Video): void {
  const weight = eventWeight(event);
  if (weight === 0) return;

  if (event.event_type === "dislike" || event.event_type === "skip") {
    if (!profile.negative_signals.includes(event.video_id)) {
      profile.negative_signals.push(event.video_id);
    }
    return;
  }

  const topics = videoMeta
    ? extractTopicsFromVideo(videoMeta)
    : [`video_${event.video_id.slice(0, 8)}`];

  // Distribute the weight evenly across all topics for this video
  const perTopicWeight = weight / topics.length;
  for (const topic of topics) {
    profile.interest_graph[topic] = (profile.interest_graph[topic] ?? 0) + perTopicWeight;
  }
}

function eventWeight(event: WatchEvent): number {
  switch (event.event_type) {
    case "like": return 1.0;
    case "watch": return Math.min((event.watch_duration_seconds ?? 0) / 300, 0.8);
    case "click": return 0.3;
    case "skip": return -0.2;
    case "dislike": return -0.5;
    default: return 0;
  }
}

function coldStartProfile(userId: string): UserProfile {
  return {
    user_id: userId,
    interest_graph: {},
    channel_prefs: {},
    format_prefs: { shorts: 0.33, long_form: 0.33, tutorials: 0.33 },
    negative_signals: [],
    last_updated: new Date().toISOString(),
  };
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
    agent: "user_profiling",
    started_at: startedAt,
    completed_at: completedAt,
    latency_ms: new Date(completedAt).getTime() - new Date(startedAt).getTime(),
    tools_called: toolsCalled,
    reasoning,
    output_count: outputCount,
    confidence,
  };
}
