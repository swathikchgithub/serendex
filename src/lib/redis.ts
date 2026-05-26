import { Redis } from "@upstash/redis";
import type { WatchEvent, UserProfile } from "@/types";

let _redis: Redis | null = null;
let _warnedMissingCreds = false;

function getRedis(): Redis | null {
  if (!_redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      if (!_warnedMissingCreds) {
        console.warn("Redis credentials missing. Caching and Profiling will be disabled.");
        _warnedMissingCreds = true;
      }
      return null;
    }

    _redis = new Redis({ url, token });
  }
  return _redis;
}

const HISTORY_KEY = (userId: string) => `user:${userId}:history`;
const PROFILE_KEY = (userId: string) => `user:${userId}:profile`;
const HISTORY_TTL = 60 * 60 * 24 * 7; // 7 days

export async function logWatchEvent(event: WatchEvent): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const key = HISTORY_KEY(event.user_id);
  await redis.lpush(key, JSON.stringify(event));
  await redis.ltrim(key, 0, 49); // keep last 50
  await redis.expire(key, HISTORY_TTL);
}

export async function getUserHistory(userId: string, limit = 20): Promise<WatchEvent[]> {
  const redis = getRedis();
  if (!redis) return [];
  const raw = await redis.lrange(HISTORY_KEY(userId), 0, limit - 1);
  return raw.map((r) => (typeof r === "string" ? JSON.parse(r) : r));
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const redis = getRedis();
  if (!redis) return null;
  const data = await redis.get(PROFILE_KEY(userId));
  if (!data) return null;
  return typeof data === "string" ? JSON.parse(data) : (data as UserProfile);
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.set(PROFILE_KEY(profile.user_id), JSON.stringify(profile), { ex: HISTORY_TTL });
}

export async function getCache<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  const data = await redis.get(`cache:${key}`);
  if (!data) return null;
  return typeof data === "string" ? JSON.parse(data) : (data as T);
}

export async function setCache(key: string, value: any, ttlSeconds = 3600 * 24): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.set(`cache:${key}`, JSON.stringify(value), { ex: ttlSeconds });
}

// Fixed-window rate limiter. Returns true if the request is allowed.
export async function checkRateLimit(
  userId: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const redis = getRedis();
  if (!redis) return { allowed: true, remaining: limit };

  const window = Math.floor(Date.now() / (windowSeconds * 1000));
  const key = `ratelimit:${userId}:${window}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, windowSeconds);

  return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
}
