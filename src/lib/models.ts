import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";

export type ModelProvider = "anthropic" | "google" | "openai";
export type ModelTier = "eco" | "pro";

export function getModel(agent: "content" | "explanation", tier: ModelTier = "eco") {
  if (tier === "pro") {
    // Pro Tier: Highest reasoning quality
    return agent === "content" 
      ? anthropic("claude-3-5-sonnet-20241022") 
      : anthropic("claude-3-5-sonnet-20241022");
  }

  // Eco Tier: Fast and cost-effective (mostly free tiers)
  if (agent === "content") {
    // Content Analysis needs tool calling support
    return google("gemini-1.5-flash");
  } else {
    // Explanation is simple text generation
    return google("gemini-1.5-flash");
  }
}
