import { Redis } from "@upstash/redis";
import type { WatchEvent, UserProfile } from "@/types";

const redis = Redis.fromEnv();

const HISTORY_KEY = (userId: string) => `user:${userId}:history`;
const PROFILE_KEY = (userId: string) => `user:${userId}:profile`;
const HISTORY_TTL = 60 * 60 * 24 * 7; // 7 days

export async function logWatchEvent(event: WatchEvent): Promise<void> {
  const key = HISTORY_KEY(event.user_id);
  await redis.lpush(key, JSON.stringify(event));
  await redis.ltrim(key, 0, 49); // keep last 50
  await redis.expire(key, HISTORY_TTL);
}

export async function getUserHistory(userId: string, limit = 20): Promise<WatchEvent[]> {
  const raw = await redis.lrange(HISTORY_KEY(userId), 0, limit - 1);
  return raw.map((r) => (typeof r === "string" ? JSON.parse(r) : r));
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const data = await redis.get(PROFILE_KEY(userId));
  if (!data) return null;
  return typeof data === "string" ? JSON.parse(data) : (data as UserProfile);
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await redis.set(PROFILE_KEY(profile.user_id), JSON.stringify(profile), { ex: HISTORY_TTL });
}
