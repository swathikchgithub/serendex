import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai, createOpenAI } from "@ai-sdk/openai";
import { groq } from "@ai-sdk/groq";
import { MODELS } from "./models-list";


const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export function getModel(agent: "content" | "explanation", modelId: string = "gpt-4o-mini") {
  const modelInfo = MODELS.find(m => m.value === modelId);
  const provider = modelInfo?.provider;

  if (provider === "anthropic") return anthropic(modelId);
  if (provider === "google") return google(modelId);
  if (provider === "groq") return groq(modelId);
  if (provider === "openai") return openai(modelId);
  if (provider === "openrouter") return openrouter(modelId);

  // Fallback
  return openai("gpt-4o-mini");
}
