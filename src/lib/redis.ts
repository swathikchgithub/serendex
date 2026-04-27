import { Redis } from "@upstash/redis";
import type { WatchEvent, UserProfile } from "@/types";

let _redis: Redis | null = null;

function getRedis(): Redis {
  if (!_redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url) throw new Error("UPSTASH_REDIS_REST_URL is missing in environment variables");
    if (!token) throw new Error("UPSTASH_REDIS_REST_TOKEN is missing in environment variables");

    _redis = new Redis({ url, token });
  }
  return _redis;
}

const HISTORY_KEY = (userId: string) => `user:${userId}:history`;
const PROFILE_KEY = (userId: string) => `user:${userId}:profile`;
const HISTORY_TTL = 60 * 60 * 24 * 7; // 7 days

export async function logWatchEvent(event: WatchEvent): Promise<void> {
  const key = HISTORY_KEY(event.user_id);
  await getRedis().lpush(key, JSON.stringify(event));
  await getRedis().ltrim(key, 0, 49); // keep last 50
  await getRedis().expire(key, HISTORY_TTL);
}

export async function getUserHistory(userId: string, limit = 20): Promise<WatchEvent[]> {
  const raw = await getRedis().lrange(HISTORY_KEY(userId), 0, limit - 1);
  return raw.map((r) => (typeof r === "string" ? JSON.parse(r) : r));
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const data = await getRedis().get(PROFILE_KEY(userId));
  if (!data) return null;
  return typeof data === "string" ? JSON.parse(data) : (data as UserProfile);
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await getRedis().set(PROFILE_KEY(profile.user_id), JSON.stringify(profile), { ex: HISTORY_TTL });
}
