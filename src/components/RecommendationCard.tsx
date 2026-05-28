"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const handleClick = () => {
    onEvent?.("click");
    router.push(`/video/${video.video_id}`);
  };

  return (
    <div
      className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 hover:bg-white/8 transition-all cursor-pointer"
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-black/40 overflow-hidden min-w-[120px] min-h-[70px]">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-4xl">
            <svg className="w-8 h-8 opacity-20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded">
          {video.duration}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white text-sm font-medium leading-snug line-clamp-2 group-hover:text-white/90">
            {video.title}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${video.video_id}`);
              alert("YouTube link copied!");
            }}
            className="shrink-0 p-1 rounded-md text-white/20 hover:text-white hover:bg-white/10 transition-all"
            title="Copy YouTube Link"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>
        <p className="text-white/50 text-[10px]">{video.channel}</p>

        {/* Explanation badge */}
        <div className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${EXPLANATION_COLORS[video.explanation_type]}`}>
          <span>{EXPLANATION_LABELS[video.explanation_type]}</span>
        </div>

        {/* Explanation text */}
        {video.explanation && (
          <p className="text-white/40 text-xs leading-relaxed italic line-clamp-2">
            {video.explanation}
          </p>
        )}

      </div>

    </div>
  );
}

