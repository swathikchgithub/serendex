import type { Video } from "@/types";

function getApiKey() {
  if (!process.env.VOYAGE_API_KEY) throw new Error("VOYAGE_API_KEY is not set");
  return process.env.VOYAGE_API_KEY;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: texts, model: "voyage-2" }),
  });

  const data = await res.json();
  return data.data.map((d: { embedding: number[] }) => d.embedding);
}

export function videoToText(video: Video): string {
  return [
    video.title,
    video.description.slice(0, 300),
    ...(video.tags ?? []),
  ].join(" ");
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
