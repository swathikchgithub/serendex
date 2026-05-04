import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@anthropic-ai/sdk", "@ai-sdk/anthropic", "@ai-sdk/google", "@ai-sdk/openai", "@ai-sdk/groq", "ai", "zod"],
  env: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
  },
};

export default nextConfig;
