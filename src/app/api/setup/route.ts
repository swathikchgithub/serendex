import { NextResponse } from "next/server";
import { setupSchema } from "@/lib/db";

// POST /api/setup — run once after deploying to Vercel to create all tables
export async function POST() {
  try {
    await setupSchema();
    return NextResponse.json({ ok: true, message: "Schema created successfully" });
  } catch (err) {
    console.error("[setup]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
