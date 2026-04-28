import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runOrchestrator } from './orchestrator';
import { runUserProfilingAgent } from './user-profiling';
import { runContentAnalysisAgent } from './content-analysis';
import { runTrendScoutAgent } from './trend-scout';

// Mock the sub-agents
vi.mock('./user-profiling', () => ({
  runUserProfilingAgent: vi.fn(),
}));

vi.mock('./content-analysis', () => ({
  runContentAnalysisAgent: vi.fn(),
}));

vi.mock('./trend-scout', () => ({
  runTrendScoutAgent: vi.fn(),
}));

vi.mock('./diversity-guard', () => ({
  runDiversityGuardAgent: vi.fn().mockReturnValue({
    final_list: [],
    diversity_score: 1.0,
    trace: { agent: 'diversity_guard', latency_ms: 5 }
  }),
}));

vi.mock('./explanation', () => ({
  runExplanationAgent: vi.fn().mockResolvedValue({
    videos: [],
    trace: { agent: 'explanation', latency_ms: 100 }
  }),
}));

vi.mock('@/lib/redis', () => ({
  getCache: vi.fn().mockResolvedValue(null),
  setCache: vi.fn().mockResolvedValue(true),
}));

describe('Orchestrator Integration', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use Cold Start strategy for new users', async () => {
    // Mock a cold start profile
    (runUserProfilingAgent as any).mockResolvedValue({
      profile: { interest_graph: {} },
      top_topics: [],
      is_cold_start: true,
      trace: { agent: 'user_profiling', latency_ms: 10 }
    });

    (runContentAnalysisAgent as any).mockResolvedValue({
      candidates: [],
      trace: { agent: 'content_analysis', latency_ms: 50 }
    });

    (runTrendScoutAgent as any).mockResolvedValue({
      trending_candidates: [],
      rising_topics: [],
      trace: { agent: 'trend_scout', latency_ms: 40 }
    });

    const result = await runOrchestrator({ userId: mockUserId, searchQuery: 'AI' });

    expect(result.meta.orchestrator_reasoning).toContain('Cold start user detected');
    expect(runContentAnalysisAgent).toHaveBeenCalledWith([], [], 'AI', 'gpt-4o-mini');
  });

  it('should use Personalization strategy for returning users', async () => {
    // Mock a returning user
    (runUserProfilingAgent as any).mockResolvedValue({
      profile: { interest_graph: { 'coding': 0.8 } },
      top_topics: ['coding'],
      is_cold_start: false,
      trace: { agent: 'user_profiling', latency_ms: 10 }
    });

    (runContentAnalysisAgent as any).mockResolvedValue({
      candidates: [],
      trace: { agent: 'content_analysis', latency_ms: 50 }
    });

    (runTrendScoutAgent as any).mockResolvedValue({
      trending_candidates: [],
      rising_topics: [],
      trace: { agent: 'trend_scout', latency_ms: 40 }
    });

    const result = await runOrchestrator({ userId: mockUserId, searchQuery: 'AI' });

    expect(result.meta.orchestrator_reasoning).toContain('Returning user');
    expect(result.meta.orchestrator_reasoning).toContain('coding');
  });
});
