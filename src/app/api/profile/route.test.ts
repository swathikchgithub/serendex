import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { auth } from "@/lib/auth";
import { getUserProfile, saveUserProfile } from "@/lib/redis";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/redis", () => ({
  getUserProfile: vi.fn(),
  saveUserProfile: vi.fn(),
}));

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/profile", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when there is no session", async () => {
    (auth as any).mockResolvedValue(null);

    const res = await POST(makeRequest({ interests: ["coding"] }));

    expect(res.status).toBe(401);
    expect(saveUserProfile).not.toHaveBeenCalled();
  });

  it("saves the profile under the session user's id, ignoring any client-supplied user_id", async () => {
    (auth as any).mockResolvedValue({ user: { id: "real-user-1" } });
    (getUserProfile as any).mockResolvedValue(null);

    const res = await POST(makeRequest({ user_id: "someone-elses-id", interests: ["coding"] }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.profile.user_id).toBe("real-user-1");
    expect(saveUserProfile).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "real-user-1" })
    );
  });

  it("returns 400 when interests is missing", async () => {
    (auth as any).mockResolvedValue({ user: { id: "real-user-1" } });

    const res = await POST(makeRequest({}));

    expect(res.status).toBe(400);
  });
});
