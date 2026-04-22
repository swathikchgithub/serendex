import { NextRequest, NextResponse } from "next/server";
import { runOrchestrator } from "@/agents/orchestrator";
import { getVideoDetails } from "@/lib/youtube";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("user_id") ?? "anonymous";
  const seedVideoId = searchParams.get("seed_video_id");
  const query = searchParams.get("q") ?? "";

  try {
    const seedVideos = seedVideoId ? await getVideoDetails([seedVideoId]) : [];

    const result = await runOrchestrator({
      userId,
      seedVideos,
      searchQuery: query,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[recommendations]", err);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}
