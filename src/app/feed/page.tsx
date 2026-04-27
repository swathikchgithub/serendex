"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RecommendationCard } from "@/components/RecommendationCard";
import { AgentTracePanel } from "@/components/AgentTrace";
import type { RecommendationResponse } from "@/types";

// Extracted into its own component so it can be wrapped in <Suspense>
// (Next.js requires this for any component using useSearchParams)
function FeedContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tier, setTier] = useState<"eco" | "pro">("eco");
  const [showTrace, setShowTrace] = useState(false);

  useEffect(() => {
    const savedTier = (localStorage.getItem("serendex_tier") as "eco" | "pro") ?? "eco";
    setTier(savedTier);
  }, []);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = localStorage.getItem("serendex_uid") ?? crypto.randomUUID();
      localStorage.setItem("serendex_uid", userId);

      const res = await fetch(`/api/recommendations?user_id=${userId}&q=${encodeURIComponent(query)}&tier=${tier}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? `Server error ${res.status}`);
      } else if (json.recommendations) {
        setData(json as RecommendationResponse);
      } else {
        setError("Unexpected response from recommendations API");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (query) fetchRecommendations();
  }, [query, tier, fetchRecommendations]);

  const handleEvent = async (videoId: string, type: "click" | "skip") => {
    const userId = localStorage.getItem("serendex_uid");
    if (!userId) return;
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, video_id: videoId, event_type: type }),
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="font-black text-xl">
            SEREN<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">DEX</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-1">
              <button
                onClick={() => {
                  setTier("eco");
                  localStorage.setItem("serendex_tier", "eco");
                }}
                className={`text-[10px] px-2 py-1 rounded-md transition-all ${tier === "eco" ? "bg-white/10 text-white font-bold" : "text-white/30 hover:text-white/50"}`}
              >
                ECO
              </button>
              <button
                onClick={() => {
                  setTier("pro");
                  localStorage.setItem("serendex_tier", "pro");
                }}
                className={`text-[10px] px-2 py-1 rounded-md transition-all ${tier === "pro" ? "bg-violet-500/20 text-violet-300 font-bold" : "text-white/30 hover:text-white/50"}`}
              >
                PRO
              </button>
            </div>
            {data?.meta && (
              <span className="text-white/30 text-xs font-mono">
                {data.meta.total_latency_ms}ms · {data.recommendations.length} results
              </span>
            )}
            <button
              onClick={() => setShowTrace(!showTrace)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${showTrace ? "border-violet-500/50 bg-violet-500/10 text-violet-300" : "border-white/10 text-white/40 hover:text-white/60"}`}
            >
              {showTrace ? "Hide" : "Show"} Agent Trace
            </button>
            <Link 
              href="/about"
              className="text-xs text-white/40 hover:text-white transition-colors"
            >
              How it works
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Query header */}
        <div className="mb-8">
          <p className="text-white/30 text-sm">Results for</p>
          <h2 className="text-2xl font-bold text-white mt-1">{query}</h2>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="flex gap-2">
              {["🧠", "⚡", "👤", "📈", "🛡️", "💬"].map((icon, i) => (
                <span
                  key={i}
                  className="text-2xl animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {icon}
                </span>
              ))}
            </div>
            <p className="text-white/40 text-sm">Agents working in parallel...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="text-red-400 text-4xl">⚠️</div>
            <p className="text-red-400 font-semibold">Something went wrong</p>
            <pre className="text-red-300/60 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 max-w-xl overflow-auto">{error}</pre>
            <button onClick={fetchRecommendations} className="text-xs px-4 py-2 rounded-lg border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all mt-2">Retry</button>
          </div>
        )}

        {/* Content */}
        {!loading && data && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Agent Trace Panel */}
            {showTrace && (
              <div className="lg:col-span-3">
                <AgentTracePanel
                  traces={data.meta.traces}
                  orchestratorReasoning={data.meta.orchestrator_reasoning}
                  totalLatency={data.meta.total_latency_ms}
                  diversityScore={data.meta.diversity_score}
                />
              </div>
            )}

            {/* Recommendations grid */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.recommendations.map((video) => (
                <RecommendationCard
                  key={video.video_id}
                  video={video}
                  onEvent={(type) => handleEvent(video.video_id, type)}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && !data && (
          <div className="text-center py-24 text-white/20">
            Enter a topic above to discover videos
          </div>
        )}
      </main>
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex gap-2">
          {["🧠", "⚡", "👤", "📈", "🛡️", "💬"].map((icon, i) => (
            <span key={i} className="text-2xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
              {icon}
            </span>
          ))}
        </div>
      </div>
    }>
      <FeedContent />
    </Suspense>
  );
}
