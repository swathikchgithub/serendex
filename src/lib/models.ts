import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai, createOpenAI } from "@ai-sdk/openai";
import { groq } from "@ai-sdk/groq";

export type ModelTier = "eco" | "speed" | "pro" | "openai" | "openrouter";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export function getModel(agent: "content" | "explanation", tier: ModelTier = "eco") {
  switch (tier) {
    case "pro":
      return anthropic("claude-3-5-sonnet-20241022");
    case "speed":
      return groq("llama-3.3-70b-versatile");
    case "openai":
      return openai("gpt-4o");
    case "openrouter":
      return openrouter("anthropic/claude-3.5-sonnet");
    case "eco":
    default:
      return google("gemini-1.5-flash");
  }
}
