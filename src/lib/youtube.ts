import type { Video } from "@/types";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
function getApiKey() {
  if (!process.env.YOUTUBE_API_KEY) throw new Error("YOUTUBE_API_KEY is not set");
  return process.env.YOUTUBE_API_KEY;
}

export async function searchYouTube(query: string, maxResults = 20): Promise<Video[]> {
  const url = new URL(`${YOUTUBE_API_BASE}/search`);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("key", getApiKey());

  const res = await fetch(url.toString());
  const data = await res.json();

  if (!data.items) return [];

  const videoIds = data.items.map((i: { id: { videoId: string } }) => i.id.videoId).join(",");
  return getVideoDetails(videoIds.split(","));
}

export async function getVideoDetails(videoIds: string[]): Promise<Video[]> {
  const url = new URL(`${YOUTUBE_API_BASE}/videos`);
  url.searchParams.set("part", "snippet,contentDetails,statistics");
  url.searchParams.set("id", videoIds.join(","));
  url.searchParams.set("key", getApiKey());

  const res = await fetch(url.toString());
  const data = await res.json();

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
