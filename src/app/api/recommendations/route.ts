import { NextRequest, NextResponse } from "next/server";
import { runOrchestrator } from "@/agents/orchestrator";
import { getVideoDetails } from "@/lib/youtube";
import { checkRateLimit } from "@/lib/redis";
import { MODELS } from "@/lib/models-list";

const VALID_MODEL_IDS = new Set(MODELS.map((m) => m.value));
const RATE_LIMIT = 20;       // requests
const RATE_WINDOW = 60;      // seconds

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("user_id") ?? "anonymous";
  const seedVideoId = searchParams.get("seed_video_id");
  const query = searchParams.get("q") ?? "";
  const modelId = searchParams.get("model") ?? "gpt-4o-mini";

  if (!VALID_MODEL_IDS.has(modelId)) {
    return NextResponse.json({ error: `Unknown model: ${modelId}` }, { status: 400 });
  }

  const { allowed, remaining } = await checkRateLimit(userId, RATE_LIMIT, RATE_WINDOW);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before making another request." },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
    );
  }

  try {
    const seedVideos = seedVideoId ? await getVideoDetails([seedVideoId]) : [];

    const result = await runOrchestrator({
      userId,
      seedVideos,
      searchQuery: query,
      modelId,
    });

    return NextResponse.json(result, {
      headers: { "X-RateLimit-Remaining": String(remaining) },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[recommendations]", message, stack);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
