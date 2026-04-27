import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai, createOpenAI } from "@ai-sdk/openai";
import { groq } from "@ai-sdk/groq";

export const MODELS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (OpenAI)', provider: 'openai' },
  { value: 'gpt-4o', label: 'GPT-4o (OpenAI)', provider: 'openai' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (OpenAI)', provider: 'openai' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku (Anthropic)', provider: 'anthropic' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet (Anthropic)', provider: 'anthropic' },
  { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Groq)', provider: 'groq' },
  { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B (Groq)', provider: 'groq' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Google)', provider: 'google' },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite (Google)', provider: 'google' },
  { value: 'deepseek/deepseek-chat', label: 'DeepSeek V3 (OpenRouter)', provider: 'openrouter' },
  { value: 'deepseek/deepseek-r1', label: 'DeepSeek R1 Reasoner (OpenRouter)', provider: 'openrouter' },
  { value: 'meta-llama/llama-4-maverick', label: 'Llama 4 Maverick (OpenRouter)', provider: 'openrouter' },
  { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro (OpenRouter)', provider: 'openrouter' },
  { value: 'openai/gpt-oss-120b:free', label: 'GPT-OSS 120B (OpenRouter)', provider: 'openrouter' },
  { value: 'openai/gpt-oss-20b:free', label: 'GPT-OSS 20B (OpenRouter)', provider: 'openrouter' },
  { value: 'google/gemma-4-31b-it', label: 'Gemma 4 31B (OpenRouter)', provider: 'openrouter' },
  { value: 'google/gemma-4-26b-a4b-it', label: 'Gemma 4 26B MoE (OpenRouter)', provider: 'openrouter' },
];

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
