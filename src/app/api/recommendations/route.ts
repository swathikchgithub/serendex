import { NextRequest, NextResponse } from "next/server";
import { runOrchestrator } from "@/agents/orchestrator";
import { getVideoDetails } from "@/lib/youtube";
import { checkRateLimit } from "@/lib/redis";
import { MODELS } from "@/lib/models-list";
import { auth } from "@/lib/auth";

const VALID_MODEL_IDS = new Set(MODELS.map((m) => m.value));
const RATE_LIMIT = 20;       // requests
const RATE_WINDOW = 60;      // seconds

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const seedVideoId = searchParams.get("seed_video_id");
  const query = searchParams.get("q") ?? "";
  const modelId = searchParams.get("model") ?? "gpt-4o-mini";

  if (!VALID_MODEL_IDS.has(modelId)) {
    return NextResponse.json({ error: `Unknown model: ${modelId}` }, { status: 400 });
  }

  const session = await auth();
  const authenticatedUserId = session?.user?.id;

  // Guests share a single non-personalized profile/cache bucket; rate limit
  // them by IP instead, since there's no verified identity to key on.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimitId = authenticatedUserId ?? `guest:${ip}`;
  const userId = authenticatedUserId ?? "guest";

  const { allowed, remaining } = await checkRateLimit(rateLimitId, RATE_LIMIT, RATE_WINDOW);
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
