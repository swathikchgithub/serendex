import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { auth } from "@/lib/auth";
import { logWatchEvent } from "@/lib/redis";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/redis", () => ({
  logWatchEvent: vi.fn(),
}));

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/events", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no-ops for guests instead of logging an event", async () => {
    (auth as any).mockResolvedValue(null);

    const res = await POST(makeRequest({ video_id: "abc", event_type: "click" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true, skipped: true });
    expect(logWatchEvent).not.toHaveBeenCalled();
  });

  it("logs the event under the session user's id, ignoring any client-supplied user_id", async () => {
    (auth as any).mockResolvedValue({ user: { id: "real-user-1" } });

    await POST(makeRequest({ user_id: "someone-elses-id", video_id: "abc", event_type: "watch" }));

    expect(logWatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "real-user-1", video_id: "abc", event_type: "watch" })
    );
  });

  it("returns 400 for an invalid event_type", async () => {
    (auth as any).mockResolvedValue({ user: { id: "real-user-1" } });

    const res = await POST(makeRequest({ video_id: "abc", event_type: "nonsense" }));

    expect(res.status).toBe(400);
    expect(logWatchEvent).not.toHaveBeenCalled();
  });
});
