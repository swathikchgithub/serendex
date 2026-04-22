export interface Video {
  video_id: string;
  title: string;
  thumbnail: string;
  channel: string;
  channel_id: string;
  duration: string;
  view_count: number;
  published_at: string;
  description: string;
  tags: string[];
}

export interface ScoredVideo extends Video {
  scores: {
    content_similarity: number;
    user_relevance: number;
    trend_score: number;
    diversity_score: number;
    final_score: number;
  };
  explanation: string;
  explanation_type: "content_match" | "interest_evolution" | "trending" | "serendipitous" | "social_proof";
}

export interface AgentTrace {
  agent: string;
  started_at: string;
  completed_at: string;
  latency_ms: number;
  tools_called: string[];
  reasoning: string;
  output_count: number;
  confidence: number;
}

export interface RecommendationResponse {
  recommendations: ScoredVideo[];
  meta: {
    agents_invoked: string[];
    total_latency_ms: number;
    orchestrator_reasoning: string;
    diversity_score: number;
    traces: AgentTrace[];
  };
}

export interface UserProfile {
  user_id: string;
  interest_graph: Record<string, number>;
  channel_prefs: Record<string, number>;
  format_prefs: { shorts: number; long_form: number; tutorials: number };
  negative_signals: string[];
  last_updated: string;
}

export interface WatchEvent {
  user_id: string;
  video_id: string;
  event_type: "click" | "watch" | "skip" | "like" | "dislike";
  watch_duration_seconds?: number;
}
