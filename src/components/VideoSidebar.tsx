"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { RecommendationResponse, ScoredVideo } from "@/types";

const EXPLANATION_COLORS: Record<ScoredVideo["explanation_type"], string> = {
  content_match: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  interest_evolution: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  trending: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  serendipitous: "bg-green-500/20 text-green-300 border-green-500/30",
  social_proof: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

const EXPLANATION_LABELS: Record<ScoredVideo["explanation_type"], string> = {
  content_match: "Content Match",
  interest_evolution: "Interest Evolution",
  trending: "Trending",
  serendipitous: "Serendipitous",
  social_proof: "Social Proof",
};

const AGENT_ICONS = ["🧠", "⚡", "👤", "📈", "🛡️", "💬"];

interface Props {
  seedVideoId: string;
}

export function VideoSidebar({ seedVideoId }: Props) {
  const router = useRouter();
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let userId = localStorage.getItem("serendex_uid") ?? crypto.randomUUID();
    localStorage.setItem("serendex_uid", userId);

    // Log a watch event for the current video
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        video_id: seedVideoId,
        event_type: "watch",
      }),
    }).catch(() => {});

    // Fetch recommendations seeded by this video
    fetch(`/api/recommendations?user_id=${userId}&seed_video_id=${seedVideoId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.recommendations) setData(json as RecommendationResponse);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [seedVideoId]);

  const handleClick = (videoId: string) => {
    const userId = localStorage.getItem("serendex_uid");
    if (userId) {
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, video_id: videoId, event_type: "click" }),
      }).catch(() => {});
    }
    router.push(`/video/${videoId}`);
  };

  return (
    <aside className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-white/70 text-sm font-semibold uppercase tracking-widest">
          Up Next
        </h2>
        {data?.meta && (
          <span className="text-white/25 text-xs font-mono">
            {data.meta.total_latency_ms}ms
          </span>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 items-center justify-center py-6">
            {AGENT_ICONS.map((icon, i) => (
              <span
                key={i}
                className="text-xl animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {icon}
              </span>
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-28 h-16 bg-white/5 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-2.5 bg-white/5 rounded w-full" />
                <div className="h-2.5 bg-white/5 rounded w-3/4" />
                <div className="h-2 bg-white/5 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendation list */}
      {!loading && data?.recommendations.map((video) => (
        <button
          key={video.video_id}
          onClick={() => handleClick(video.video_id)}
          className="group flex gap-3 text-left w-full hover:bg-white/5 rounded-xl p-2 -mx-2 transition-all"
        >
          {/* Thumbnail */}
          <div className="relative flex-shrink-0 w-28 aspect-video rounded-lg overflow-hidden bg-black/40">
            {video.thumbnail ? (
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20 text-xl">▶</div>
            )}
            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 py-0.5 rounded">
              {video.duration}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-white text-xs font-medium leading-snug line-clamp-2 group-hover:text-white/90">
              {video.title}
            </p>
            <p className="text-white/40 text-[11px]">{video.channel}</p>
            <span
              className={`inline-flex text-[10px] px-1.5 py-0.5 rounded-full border ${EXPLANATION_COLORS[video.explanation_type]}`}
            >
              {EXPLANATION_LABELS[video.explanation_type]}
            </span>
          </div>
        </button>
      ))}

      {!loading && !data && (
        <p className="text-white/20 text-xs text-center py-8">Could not load recommendations.</p>
      )}
    </aside>
  );
}
