"use client";

import type { ScoredVideo } from "@/types";

const EXPLANATION_COLORS = {
  content_match: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  interest_evolution: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  trending: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  serendipitous: "bg-green-500/20 text-green-300 border-green-500/30",
  social_proof: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

const EXPLANATION_LABELS = {
  content_match: "Content Match",
  interest_evolution: "Interest Evolution",
  trending: "Trending",
  serendipitous: "Serendipitous",
  social_proof: "Social Proof",
};

interface Props {
  video: ScoredVideo;
  onEvent?: (type: "click" | "skip") => void;
}

export function RecommendationCard({ video, onEvent }: Props) {
  const scorePercent = Math.round(video.scores.final_score * 100);

  return (
    <div
      className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 hover:bg-white/8 transition-all cursor-pointer"
      onClick={() => onEvent?.("click")}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-black/40 overflow-hidden">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-4xl">▶</div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
          {video.duration}
        </div>
        <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
          {scorePercent}%
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <h3 className="text-white text-sm font-medium leading-snug line-clamp-2 group-hover:text-white/90">
          {video.title}
        </h3>
        <p className="text-white/50 text-xs">{video.channel}</p>

        {/* Explanation badge */}
        <div className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border ${EXPLANATION_COLORS[video.explanation_type]}`}>
          <span>{EXPLANATION_LABELS[video.explanation_type]}</span>
        </div>

        {/* Explanation text */}
        {video.explanation && (
          <p className="text-white/40 text-xs leading-relaxed italic line-clamp-2">
            {video.explanation}
          </p>
        )}

        {/* Score bars */}
        <div className="space-y-1 pt-1">
          <ScoreBar label="Content" value={video.scores.content_similarity} color="bg-blue-400" />
          <ScoreBar label="Trend" value={video.scores.trend_score} color="bg-orange-400" />
          <ScoreBar label="Relevance" value={video.scores.user_relevance} color="bg-purple-400" />
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-white/30 text-xs w-14">{label}</span>
      <div className="flex-1 bg-white/5 rounded-full h-1">
        <div
          className={`h-1 rounded-full ${color} transition-all`}
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
      <span className="text-white/20 text-xs w-6">{Math.round(value * 100)}</span>
    </div>
  );
}
