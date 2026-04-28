import { NextRequest, NextResponse } from "next/server";
import { getUserProfile, saveUserProfile } from "@/lib/redis";
import type { UserProfile } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { user_id, interests } = await req.json();

    if (!user_id || !interests || !Array.isArray(interests)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const profile: UserProfile = (await getUserProfile(user_id)) ?? {
      user_id,
      interest_graph: {},
      channel_prefs: {},
      format_prefs: { shorts: 0.33, long_form: 0.33, tutorials: 0.33 },
      negative_signals: [],
      last_updated: new Date().toISOString(),
    };

    // Boost selected interests
    interests.forEach((topic: string) => {
      const key = topic.toLowerCase().replace(/\s+/g, "_");
      profile.interest_graph[key] = (profile.interest_graph[key] ?? 0) + 1.5;
    });

    profile.last_updated = new Date().toISOString();
    await saveUserProfile(profile);

    return NextResponse.json({ success: true, profile });
  } catch (err) {
    console.error("[profile-api]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
