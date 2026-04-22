import { NextRequest, NextResponse } from "next/server";
import { logWatchEvent } from "@/lib/redis";
import type { WatchEvent } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const event: WatchEvent = await req.json();

    if (!event.user_id || !event.video_id || !event.event_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await logWatchEvent(event);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[events]", err);
    return NextResponse.json({ error: "Failed to log event" }, { status: 500 });
  }
}
