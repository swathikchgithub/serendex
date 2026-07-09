import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/redis";
import { runOrchestrator } from "@/agents/orchestrator";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/redis", () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock("@/lib/youtube", () => ({
  getVideoDetails: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/agents/orchestrator", () => ({
  runOrchestrator: vi.fn(),
}));

function makeRequest(qs: string, headers?: Record<string, string>) {
  return new NextRequest(`http://localhost/api/recommendations?${qs}`, { headers });
}

const mockResult = {
  recommendations: [],
  meta: {
    agents_invoked: [],
    total_latency_ms: 1,
    orchestrator_reasoning: "",
    diversity_score: 1,
    traces: [],
  },
};

describe("GET /api/recommendations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (checkRateLimit as any).mockResolvedValue({ allowed: true, remaining: 19 });
    (runOrchestrator as any).mockResolvedValue(mockResult);
  });

  it("returns 400 for an unknown model", async () => {
    (auth as any).mockResolvedValue(null);

    const res = await GET(makeRequest("q=ai&model=not-a-real-model"));

    expect(res.status).toBe(400);
  });

  it("uses the session user's id for personalization when authenticated, ignoring any client-supplied user_id", async () => {
    (auth as any).mockResolvedValue({ user: { id: "real-user-1" } });

    await GET(makeRequest("q=ai&model=gpt-4o-mini&user_id=someone-elses-id"));

    expect(runOrchestrator).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "real-user-1" })
    );
    expect(checkRateLimit).toHaveBeenCalledWith("real-user-1", expect.any(Number), expect.any(Number));
  });

  it("falls back to a shared guest identity and IP-based rate limiting when unauthenticated", async () => {
    (auth as any).mockResolvedValue(null);

    await GET(makeRequest("q=ai&model=gpt-4o-mini", { "x-forwarded-for": "1.2.3.4" }));

    expect(runOrchestrator).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "guest" })
    );
    expect(checkRateLimit).toHaveBeenCalledWith("guest:1.2.3.4", expect.any(Number), expect.any(Number));
  });
});
