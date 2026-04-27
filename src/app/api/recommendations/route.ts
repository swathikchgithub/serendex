import { NextRequest, NextResponse } from "next/server";
import { runOrchestrator } from "@/agents/orchestrator";
import { getVideoDetails } from "@/lib/youtube";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("user_id") ?? "anonymous";
  const seedVideoId = searchParams.get("seed_video_id");
  const query = searchParams.get("q") ?? "";
  const modelId = searchParams.get("model") ?? "gpt-4o-mini";

  try {
    const seedVideos = seedVideoId ? await getVideoDetails([seedVideoId]) : [];

    const result = await runOrchestrator({
      userId,
      seedVideos,
      searchQuery: query,
      modelId,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[recommendations]", message, stack);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
