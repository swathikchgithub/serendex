import type { RecommendationResponse } from "@/types";

export const DEMO_SCENARIOS: Record<string, RecommendationResponse> = {
  "quantum-computing": {
    recommendations: [
      {
        video_id: "uK6_D8O80Vw",
        title: "Quantum Computing for Babies",
        thumbnail: "https://i.ytimg.com/vi/uK6_D8O80Vw/hqdefault.jpg",
        channel: "Chris Ferrie",
        channel_id: "UCbabies",
        duration: "5:12",
        view_count: 1200000,
        published_at: "2023-01-01",
        description: "A simple introduction to the basics of quantum physics.",
        tags: ["Quantum", "Physics", "Intro"],
        explanation: "Content Analysis Agent found this to be the perfect 'Mental Model' builder before diving deeper into qubits.",
        explanation_type: "content_match",
        scores: { content_similarity: 0.95, user_relevance: 0.8, trend_score: 0.4, diversity_score: 0.9, final_score: 0.92 }
      },
      {
        video_id: "-UlxHPIEVqA",
        title: "The Map of Quantum Computing",
        thumbnail: "https://i.ytimg.com/vi/-UlxHPIEVqA/hqdefault.jpg",
        channel: "Domain of Science",
        channel_id: "UCdomain",
        duration: "18:45",
        view_count: 3400000,
        published_at: "2023-06-15",
        description: "A complete overview of the quantum computing landscape.",
        tags: ["Quantum", "Technology", "Future"],
        explanation: "Orchestrator cross-referenced this with your 'Tech Enthusiast' profile to provide a high-level strategic view.",
        explanation_type: "interest_evolution",
        scores: { content_similarity: 0.85, user_relevance: 0.9, trend_score: 0.6, diversity_score: 0.8, final_score: 0.88 }
      },
      {
        video_id: "QuR969uMICM",
        title: "Programming a Quantum Computer with Qiskit",
        thumbnail: "https://i.ytimg.com/vi/QuR969uMICM/hqdefault.jpg",
        channel: "IBM Quantum",
        channel_id: "UCibm",
        duration: "45:30",
        view_count: 150000,
        published_at: "2024-02-10",
        description: "Learn how to write your first quantum circuit.",
        tags: ["Coding", "IBM", "Quantum"],
        explanation: "Trend Scout identified 'Quantum Coding' as a rising skill set in your professional circle.",
        explanation_type: "trending",
        scores: { content_similarity: 0.75, user_relevance: 0.6, trend_score: 0.95, diversity_score: 0.7, final_score: 0.82 }
      }
    ],
    meta: {
      agents_invoked: ["content_analysis", "user_profiling", "trend_scout", "diversity_guard"],
      total_latency_ms: 1240,
      orchestrator_reasoning: "The goal is to move from conceptual understanding (babies) to landscape mapping (domain of science) and finally to practical application (IBM). This multi-step path ensures deep retention of Quantum principles.",
      diversity_score: 0.88,
      traces: [],
      is_cached: true
    }
  },
  "minimalist-design": {
    recommendations: [
      {
        video_id: "72W8v0_M2QE",
        title: "The Philosophy of Dieter Rams",
        thumbnail: "https://i.ytimg.com/vi/72W8v0_M2QE/hqdefault.jpg",
        channel: "Design Theory",
        channel_id: "UCdesign",
        duration: "12:15",
        view_count: 560000,
        published_at: "2022-11-20",
        description: "Less but better. Exploring the 10 principles of good design.",
        tags: ["Design", "Minimalism", "Rams"],
        explanation: "Serendipity Agent found a connection between your interest in 'Productivity' and Rams' minimalist principles.",
        explanation_type: "serendipitous",
        scores: { content_similarity: 0.6, user_relevance: 0.95, trend_score: 0.3, diversity_score: 0.9, final_score: 0.85 }
      }
    ],
    meta: {
      agents_invoked: ["content_analysis", "user_profiling"],
      total_latency_ms: 850,
      orchestrator_reasoning: "Since you frequently search for productivity tools, the engine identifies 'Minimalist Philosophy' as the aesthetic foundation for the tools you use.",
      diversity_score: 0.92,
      traces: [],
      is_cached: true
    }
  }
};
