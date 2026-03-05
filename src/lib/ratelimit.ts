// ─── VanJet · Rate Limiting for Login & API ───────────────────
// Uses @upstash/ratelimit + @upstash/redis.
// Optional: requires UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
// Gracefully allows requests if not configured.

import { serverEnv } from "@/lib/env";

type LimitResult = Awaited<ReturnType<InstanceType<typeof import("@upstash/ratelimit").Ratelimit>["limit"]>>;

async function getRateLimiter(
  max: number,
  window: "15 m",
  prefix: string
): Promise<InstanceType<typeof import("@upstash/ratelimit").Ratelimit> | null> {
  const url = serverEnv.UPSTASH_REDIS_REST_URL;
  const token = serverEnv.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const { Redis } = await import("@upstash/redis");
  const { Ratelimit } = await import("@upstash/ratelimit");
  const redis = new Redis({ url, token });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, window),
    prefix,
  });
}

/** Login: 5 attempts per 15 minutes per identifier (email). */
export async function checkLoginRateLimit(identifier: string): Promise<LimitResult> {
  const limiter = await getRateLimiter(5, "15 m", "login_rate_limit");
  if (!limiter) {
    return { success: true, limit: 5, remaining: 5, reset: 0, pending: Promise.resolve() };
  }
  return limiter.limit(identifier);
}

/** API: 60 requests per 15 minutes per identifier (IP). */
export async function checkApiRateLimit(identifier: string): Promise<LimitResult> {
  const limiter = await getRateLimiter(60, "15 m", "api_rate_limit");
  if (!limiter) {
    return { success: true, limit: 60, remaining: 60, reset: 0, pending: Promise.resolve() };
  }
  return limiter.limit(identifier);
}
