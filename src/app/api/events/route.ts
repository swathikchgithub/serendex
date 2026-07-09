import { NextRequest, NextResponse } from "next/server";
import { logWatchEvent } from "@/lib/redis";
import { auth } from "@/lib/auth";
import type { WatchEvent } from "@/types";

export async function POST(req: NextRequest) {
  const VALID_EVENT_TYPES: WatchEvent["event_type"][] = ["click", "watch", "skip", "like", "dislike"];

  try {
    const session = await auth();
    if (!session?.user?.id) {
      // Guests aren't tracked — no-op rather than error, since browsing
      // without an account is a supported flow.
      return NextResponse.json({ ok: true, skipped: true });
    }

    const body = await req.json();

    if (!body.video_id || !body.event_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!VALID_EVENT_TYPES.includes(body.event_type)) {
      return NextResponse.json({ error: "Invalid event_type" }, { status: 400 });
    }

    const event: WatchEvent = {
      user_id: session.user.id,
      video_id: body.video_id,
      event_type: body.event_type,
      watch_duration_seconds: body.watch_duration_seconds,
    };

    await logWatchEvent(event);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[events]", err);
    return NextResponse.json({ error: "Failed to log event" }, { status: 500 });
  }
}
