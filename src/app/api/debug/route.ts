import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    OPENAI: process.env.OPENAI_API_KEY ? "SET" : "MISSING",
    ANTHROPIC: process.env.ANTHROPIC_API_KEY ? "SET" : "MISSING",
    GROQ: process.env.GROQ_API_KEY ? "SET" : "MISSING",
    GOOGLE: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "SET" : "MISSING",
    OPENROUTER: process.env.OPENROUTER_API_KEY ? "SET" : "MISSING",
    YOUTUBE: process.env.YOUTUBE_API_KEY ? "SET" : "MISSING",
    VOYAGE: process.env.VOYAGE_API_KEY ? "SET" : "MISSING",
    UPSTASH_URL: process.env.UPSTASH_REDIS_REST_URL ? "SET" : "MISSING",
    UPSTASH_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? "SET (" + process.env.UPSTASH_REDIS_REST_TOKEN.length + " chars)" : "MISSING",
    POSTGRES: process.env.POSTGRES_URL ? "SET" : "MISSING",
  });
}
