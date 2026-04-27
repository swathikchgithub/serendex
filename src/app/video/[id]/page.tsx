import { notFound } from "next/navigation";
import { getVideoDetails } from "@/lib/youtube";
import { VideoSidebar } from "@/components/VideoSidebar";
import { Header } from "@/components/Header";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function VideoPage({ params }: Props) {
  const { id } = await params;
  const videos = await getVideoDetails([id]);
  const video = videos[0];

  if (!video) notFound();

  const viewCount = video.view_count.toLocaleString();
  const publishedDate = new Date(video.published_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <Header title={video.title} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left column: player + metadata ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Player */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10">
              <iframe
                src={`https://www.youtube.com/embed/${video.video_id}?autoplay=1&rel=0&modestbranding=1`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>

            {/* Title & channel */}
            <div className="space-y-3">
              <h1 className="text-xl sm:text-2xl font-bold leading-snug text-white">
                {video.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold shrink-0">
                    {video.channel[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{video.channel}</p>
                    <p className="text-white/40 text-xs">YouTube Channel</p>
                  </div>
                </div>

                <a
                  href={`https://www.youtube.com/watch?v=${video.video_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-4 py-2 rounded-lg bg-red-600/90 hover:bg-red-600 text-white font-semibold transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 3.993L9 16z"/>
                  </svg>
                  Watch on YouTube
                </a>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/40 pt-1 border-t border-white/8">
                <span>{viewCount} views</span>
                <span>·</span>
                <span>{publishedDate}</span>
                <span>·</span>
                <span>{video.duration}</span>
              </div>

              {/* Description */}
              {video.description && (
                <div className="bg-white/5 rounded-xl p-4 text-sm text-white/50 leading-relaxed whitespace-pre-line line-clamp-6 hover:line-clamp-none transition-all cursor-pointer">
                  {video.description}
                </div>
              )}

              {/* Tags */}
              {video.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {video.tags.slice(0, 8).map((tag) => (
                    <Link
                      key={tag}
                      href={`/feed?q=${encodeURIComponent(tag)}`}
                      className="text-xs text-violet-400/70 border border-violet-500/20 rounded-full px-3 py-1 hover:border-violet-500/50 hover:text-violet-300 transition-all"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right column: agent-powered sidebar ── */}
          <div className="lg:col-span-1">
            <VideoSidebar seedVideoId={id} />
          </div>
        </div>
      </main>
    </div>
  );
}
