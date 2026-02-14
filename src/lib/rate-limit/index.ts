// ─── VanJet · Rate Limiter (Upstash Redis) ────────────────────
// Sliding-window rate limiting for tracking endpoints.
// Optional: requires UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
// Gracefully skips limiting if not configured.

import { NextResponse } from "next/server";

// Types
interface RateLimitResult {
  ok: boolean;
  remaining: number | null;
  reset: number | null;
  skipped: boolean;
}

// Lazy-init Redis and Ratelimit only if env vars are present
let redis: any = null;
let Ratelimit: any = null;
let Redis: any = null;

function isRedisConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

async function getRedis(): Promise<any> {
  if (!isRedisConfigured()) return null;
  if (redis) return redis;

  try {
    // Dynamic import to avoid build-time crashes when deps missing
    const { Redis: RedisClass } = await import("@upstash/redis");
    Redis = RedisClass;
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    return redis;
  } catch (err) {
    console.warn("[VanJet] Redis init failed:", err);
    return null;
  }
}

async function getRatelimitClass(): Promise<any> {
  if (Ratelimit) return Ratelimit;
  try {
    const module = await import("@upstash/ratelimit");
    Ratelimit = module.Ratelimit;
    return Ratelimit;
  } catch (err) {
    console.warn("[VanJet] Ratelimit import failed:", err);
    return null;
  }
}

// ── Pre-configured limiters ────────────────────────────────────

/** /api/tracking/latest — 60 requests per minute per IP */
export async function getLatestLimiter(): Promise<any> {
  if (!isRedisConfigured()) return null;
  const r = await getRedis();
  const RatelimitClass = await getRatelimitClass();
  if (!r || !RatelimitClass) return null;

  return new RatelimitClass({
    redis: r,
    limiter: RatelimitClass.slidingWindow(60, "60 s"),
    prefix: "rl:tracking:latest",
  });
}

/** /api/tracking/subscribe — 10 connections per minute per IP */
export async function getSubscribeLimiter(): Promise<any> {
  if (!isRedisConfigured()) return null;
  const r = await getRedis();
  const RatelimitClass = await getRatelimitClass();
  if (!r || !RatelimitClass) return null;

  return new RatelimitClass({
    redis: r,
    limiter: RatelimitClass.slidingWindow(10, "60 s"),
    prefix: "rl:tracking:subscribe",
  });
}

/** /api/tracking/update — 30 requests per minute per driver */
export async function getUpdateLimiter(): Promise<any> {
  if (!isRedisConfigured()) return null;
  const r = await getRedis();
  const RatelimitClass = await getRatelimitClass();
  if (!r || !RatelimitClass) return null;

  return new RatelimitClass({
    redis: r,
    limiter: RatelimitClass.slidingWindow(30, "60 s"),
    prefix: "rl:tracking:update",
  });
}

// ── Helper: extract client IP from request ─────────────────────
export function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

// ── Helper: apply limiter and return result ────────────────────
export async function applyRateLimit(
  limiter: any,
  identifier: string
): Promise<RateLimitResult> {
  // Skip if Redis not configured
  if (!limiter) {
    return { ok: true, remaining: null, reset: null, skipped: true };
  }

  try {
    const { success, remaining, reset } = await limiter.limit(identifier);
    return {
      ok: success,
      remaining,
      reset,
      skipped: false,
    };
  } catch (err) {
    console.warn("[VanJet] Rate limit check failed:", err);
    // Fail open — allow request if Redis errors
    return { ok: true, remaining: null, reset: null, skipped: true };
  }
}
