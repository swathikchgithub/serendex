import { getUserHistory, getUserProfile, saveUserProfile } from "@/lib/redis";
import type { UserProfile, WatchEvent, AgentTrace } from "@/types";

interface ProfilingResult {
  profile: UserProfile;
  top_topics: string[];
  is_cold_start: boolean;
  confidence: number;
  trace: AgentTrace;
}

export async function runUserProfilingAgent(userId: string): Promise<ProfilingResult> {
  const startedAt = new Date().toISOString();

  const [history, existingProfile] = await Promise.all([
    getUserHistory(userId, 20),
    getUserProfile(userId),
  ]);

  const isColdStart = history.length < 3;

  if (isColdStart) {
    const emptyProfile: UserProfile = {
      user_id: userId,
      interest_graph: {},
      channel_prefs: {},
      format_prefs: { shorts: 0.33, long_form: 0.33, tutorials: 0.33 },
      negative_signals: [],
      last_updated: new Date().toISOString(),
    };
    return {
      profile: emptyProfile,
      top_topics: [],
      is_cold_start: true,
      confidence: 0.1,
      trace: buildTrace(startedAt, ["get_user_history"], 0, 0.1, "Cold start — insufficient history"),
    };
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

  // Process new events
  for (const event of history) {
    updateProfileFromEvent(profile, event);
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
      ["get_user_history", "get_user_profile", "save_user_profile"],
      history.length,
      confidence,
      `Processed ${history.length} events. Top interests: ${topTopics.join(", ")}`
    ),
  };
}

function updateProfileFromEvent(profile: UserProfile, event: WatchEvent): void {
  const weight = eventWeight(event);
  if (weight === 0) return;

  // We don't have video metadata here — in production, fetch from cache
  // For now, use video_id as a proxy topic key
  if (event.event_type === "dislike" || event.event_type === "skip") {
    if (!profile.negative_signals.includes(event.video_id)) {
      profile.negative_signals.push(event.video_id);
    }
    return;
  }

  const topic = `video_${event.video_id.slice(0, 8)}`; // placeholder until we have metadata
  profile.interest_graph[topic] = (profile.interest_graph[topic] ?? 0) + weight;
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
