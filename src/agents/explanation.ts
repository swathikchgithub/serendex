import Anthropic from "@anthropic-ai/sdk";
import type { ScoredVideo, UserProfile, AgentTrace } from "@/types";

const client = new Anthropic();

interface ExplanationResult {
  videos: ScoredVideo[];
  trace: AgentTrace;
}

export async function runExplanationAgent(
  videos: ScoredVideo[],
  userProfile: UserProfile,
  risingTopics: string[]
): Promise<ExplanationResult> {
  const startedAt = new Date().toISOString();

  const topInterests = Object.entries(userProfile.interest_graph)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([topic]) => topic);

  const prompt = `You are the Explanation Agent for SERENDEX, a YouTube recommendation engine.

User's top interests: ${topInterests.join(", ") || "not yet established"}
Currently rising topics: ${risingTopics.join(", ") || "none detected"}

For each video below, write a SHORT (1-2 sentence) explanation of WHY it was recommended.
Make explanations feel personal, insightful, and specific — not generic.
Also assign an explanation_type from: content_match | interest_evolution | trending | serendipitous | social_proof

Videos:
${videos.map((v, i) => `${i + 1}. "${v.title}" by ${v.channel} (scores: content=${v.scores.content_similarity.toFixed(2)}, trend=${v.scores.trend_score.toFixed(2)})`).join("\n")}

Respond with a JSON array (same order as input):
[{"explanation": "...", "explanation_type": "..."}]`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  let explanations: { explanation: string; explanation_type: ScoredVideo["explanation_type"] }[] = [];

  try {
    const text = (textBlock as Anthropic.TextBlock).text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      explanations = JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Fallback: generic explanations
    explanations = videos.map(() => ({
      explanation: "Recommended based on your viewing history and current trends.",
      explanation_type: "content_match" as const,
    }));
  }

  const enriched = videos.map((v, i) => ({
    ...v,
    explanation: explanations[i]?.explanation ?? "Recommended for you.",
    explanation_type: explanations[i]?.explanation_type ?? "content_match",
  }));

  const completedAt = new Date().toISOString();
  const trace: AgentTrace = {
    agent: "explanation",
    started_at: startedAt,
    completed_at: completedAt,
    latency_ms: new Date(completedAt).getTime() - new Date(startedAt).getTime(),
    tools_called: ["claude_sonnet"],
    reasoning: "Generated personalized explanations for all recommendations",
    output_count: enriched.length,
    confidence: 0.9,
  };

  return { videos: enriched, trace };
}
