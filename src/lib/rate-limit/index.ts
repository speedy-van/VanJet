// ─── VanJet · Rate Limiter (Upstash Redis) ────────────────────
// Sliding-window rate limiting for tracking endpoints.
// Requires env: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Lazy-init to avoid crashing if env vars are missing at import time
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

// ── Pre-configured limiters ────────────────────────────────────

/** /api/tracking/latest — 60 requests per minute per IP */
export function getLatestLimiter(): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;
  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(60, "60 s"),
    prefix: "rl:tracking:latest",
  });
}

/** /api/tracking/subscribe — 10 connections per minute per IP */
export function getSubscribeLimiter(): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;
  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    prefix: "rl:tracking:subscribe",
  });
}

/** /api/tracking/update — 30 requests per minute per driver */
export function getUpdateLimiter(): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;
  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(30, "60 s"),
    prefix: "rl:tracking:update",
  });
}

// ── Helper: extract client IP from request ─────────────────────
export function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

// ── Helper: apply limiter and return 429 if exceeded ───────────
export async function applyRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<NextResponse | null> {
  if (!limiter) return null; // skip if Redis not configured
  const { success, remaining, reset } = await limiter.limit(identifier);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    );
  }
  return null;
}
