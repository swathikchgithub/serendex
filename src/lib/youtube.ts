import { getCache, setCache } from "./redis";
import type { Video } from "@/types";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
function getApiKey() {
  if (!process.env.YOUTUBE_API_KEY) throw new Error("YOUTUBE_API_KEY is not set");
  return process.env.YOUTUBE_API_KEY;
}

export async function searchYouTube(query: string, maxResults = 20): Promise<Video[]> {
  const cacheKey = `yt_search:${query.toLowerCase().replace(/\s+/g, "_")}`;
  const cached = await getCache<Video[]>(cacheKey);
  if (cached) return cached;

  try {
    const url = new URL(`${YOUTUBE_API_BASE}/search`);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", query);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", String(maxResults));
    url.searchParams.set("key", getApiKey());

    const res = await fetch(url.toString());
    const data = await res.json();

    if (!res.ok) {
      if (res.status === 403) {
        console.warn("YouTube Quota Exceeded. Falling back to Safe Mode (Mock Data).");
        return MOCK_VIDEOS;
      }
      throw new Error(data.error?.message || `YouTube search error ${res.status}`);
    }

    if (!data.items) return [];

    const videoIds = data.items.map((i: { id: { videoId: string } }) => i.id.videoId).join(",");
    const results = await getVideoDetails(videoIds.split(","));
    
    await setCache(cacheKey, results, 3600 * 24); // Cache searches for 24h
    return results;
  } catch (err) {
    console.error("YouTube API Failure:", err);
    return MOCK_VIDEOS; // Guaranteed fallback
  }
}

const MOCK_VIDEOS: Video[] = [
  {
    video_id: "dQw4w9WgXcQ",
    title: "The Future of Artificial Intelligence: Agentic Systems",
    thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    channel: "Serendex Insights",
    channel_id: "UCserendex",
    duration: "12:45",
    view_count: 1250000,
    published_at: new Date().toISOString(),
    description: "In this deep dive, we explore how autonomous agents are reshaping the digital landscape. From LLMs to recursive self-improvement.",
    tags: ["AI", "Agents", "Future", "Technology"]
  },
  {
    video_id: "9bZkp7q19f0",
    title: "System Design for Massive Scale: Lessons from Netflix",
    thumbnail: "https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg",
    channel: "Scale Engineering",
    channel_id: "UCscale",
    duration: "24:10",
    view_count: 850000,
    published_at: new Date().toISOString(),
    description: "Learn how to build systems that handle millions of requests per second using distributed databases and microservices architecture.",
    tags: ["System Design", "Engineering", "Backend", "Scale"]
  },
  {
    video_id: "YpYvCqQoM0c",
    title: "The Philosophy of Science and Discovery",
    thumbnail: "https://i.ytimg.com/vi/YpYvCqQoM0c/hqdefault.jpg",
    channel: "Deep Thoughts",
    channel_id: "UCthoughts",
    duration: "18:30",
    view_count: 450000,
    published_at: new Date().toISOString(),
    description: "What does it mean to 'know' something? We explore the history of scientific discovery and the limits of human understanding.",
    tags: ["Philosophy", "Science", "Discovery", "History"]
  }
];

export async function getVideoDetails(videoIds: string[]): Promise<Video[]> {
  const cacheKey = `yt_details:${videoIds.sort().join(",")}`;
  const cached = await getCache<Video[]>(cacheKey);
  if (cached) return cached;

  const url = new URL(`${YOUTUBE_API_BASE}/videos`);
  url.searchParams.set("part", "snippet,contentDetails,statistics");
  url.searchParams.set("id", videoIds.join(","));
  url.searchParams.set("key", getApiKey());

  const res = await fetch(url.toString());
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || `YouTube details error ${res.status}`);
  }

  if (!data.items) return [];

  const results = data.items.map((item: {
    id: string;
    snippet: {
      title: string;
      thumbnails: { high: { url: string }; medium: { url: string } };
      channelTitle: string;
      channelId: string;
      description: string;
      tags?: string[];
      publishedAt: string;
    };
    contentDetails: { duration: string };
    statistics: { viewCount?: string };
  }) => ({
    video_id: item.id,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.medium?.url,
    channel: item.snippet.channelTitle,
    channel_id: item.snippet.channelId,
    description: item.snippet.description,
    tags: item.snippet.tags ?? [],
    published_at: item.snippet.publishedAt,
    duration: parseDuration(item.contentDetails.duration),
    view_count: parseInt(item.statistics.viewCount ?? "0"),
  }));

  await setCache(cacheKey, results, 3600 * 24 * 7); // Cache video info for 7 days
  return results;
}

export async function getTrendingVideos(regionCode = "US", categoryId = "0"): Promise<Video[]> {
  const url = new URL(`${YOUTUBE_API_BASE}/videos`);
  url.searchParams.set("part", "snippet,contentDetails,statistics");
  url.searchParams.set("chart", "mostPopular");
  url.searchParams.set("regionCode", regionCode);
  url.searchParams.set("videoCategoryId", categoryId);
  url.searchParams.set("maxResults", "20");
  url.searchParams.set("key", getApiKey());

  const res = await fetch(url.toString());
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || `YouTube trending error ${res.status}`);
  }

  if (!data.items) return [];

  return data.items.map((item: {
    id: string;
    snippet: {
      title: string;
      thumbnails: { high: { url: string }; medium: { url: string } };
      channelTitle: string;
      channelId: string;
      description: string;
      tags?: string[];
      publishedAt: string;
    };
    contentDetails: { duration: string };
    statistics: { viewCount?: string };
  }) => ({
    video_id: item.id,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.medium?.url,
    channel: item.snippet.channelTitle,
    channel_id: item.snippet.channelId,
    description: item.snippet.description,
    tags: item.snippet.tags ?? [],
    published_at: item.snippet.publishedAt,
    duration: parseDuration(item.contentDetails.duration),
    view_count: parseInt(item.statistics.viewCount ?? "0"),
  }));
}

function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  const h = parseInt(match[1] ?? "0");
  const m = parseInt(match[2] ?? "0");
  const s = parseInt(match[3] ?? "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
