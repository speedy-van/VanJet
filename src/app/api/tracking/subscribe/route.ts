// ─── VanJet · SSE Tracking Stream ─────────────────────────────
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { bookings, bookingTrackingEvents } from "@/lib/db/schema";
import { eq, desc, and, gt } from "drizzle-orm";
import { getSubscribeLimiter, applyRateLimit, getClientIP } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Max SSE connection duration: 30 minutes
const MAX_SSE_DURATION_MS = 30 * 60 * 1000;

export async function GET(req: NextRequest) {
  // ── Rate limiting ─────────────────────────────────────────
  const rateLimited = await applyRateLimit(
    getSubscribeLimiter(),
    getClientIP(req)
  );
  if (rateLimited) return rateLimited;

  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return new Response("Missing token parameter.", { status: 400 });
  }

  // Validate token
  const [booking] = await db
    .select({
      id: bookings.id,
      trackingEnabled: bookings.trackingEnabled,
      trackingExpiresAt: bookings.trackingExpiresAt,
    })
    .from(bookings)
    .where(eq(bookings.trackingToken, token))
    .limit(1);

  if (!booking) {
    return new Response("Invalid tracking token.", { status: 404 });
  }

  if (!booking.trackingEnabled) {
    return new Response("Tracking is disabled for this booking.", {
      status: 403,
    });
  }

  // ── Token expiry check ──────────────────────────────────────
  if (booking.trackingExpiresAt && new Date() > booking.trackingExpiresAt) {
    await db
      .update(bookings)
      .set({ trackingEnabled: false, updatedAt: new Date() })
      .where(eq(bookings.id, booking.id));
    return new Response("Tracking has expired for this delivery.", {
      status: 410,
    });
  }

  const bookingId = booking.id;

  // Create SSE stream
  const encoder = new TextEncoder();
  let lastSentAt = new Date(0);
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${data}\n\n`));
        } catch {
          closed = true;
        }
      };

      // Send initial ping
      send("ping", JSON.stringify({ ts: Date.now() }));

      // Poll loop
      const interval = setInterval(async () => {
        if (closed) {
          clearInterval(interval);
          return;
        }

        try {
          const [latest] = await db
            .select()
            .from(bookingTrackingEvents)
            .where(
              and(
                eq(bookingTrackingEvents.bookingId, bookingId),
                gt(bookingTrackingEvents.recordedAt, lastSentAt)
              )
            )
            .orderBy(desc(bookingTrackingEvents.recordedAt))
            .limit(1);

          if (latest) {
            lastSentAt = latest.recordedAt;
            send(
              "location",
              JSON.stringify({
                lat: Number(latest.lat),
                lng: Number(latest.lng),
                heading: latest.heading,
                speedKph: latest.speedKph ? Number(latest.speedKph) : null,
                accuracyM: latest.accuracyM,
                status: latest.status,
                recordedAt: latest.recordedAt.toISOString(),
              })
            );
          }
        } catch (err) {
          console.error("[VanJet] SSE poll error:", err);
        }
      }, 2000);

      // Ping every 15s to keep connection alive
      const pingInterval = setInterval(() => {
        if (closed) {
          clearInterval(pingInterval);
          return;
        }
        send("ping", JSON.stringify({ ts: Date.now() }));
      }, 15000);

      // Max duration guard — close after MAX_SSE_DURATION_MS
      const maxDurationTimer = setTimeout(() => {
        if (!closed) {
          closed = true;
          clearInterval(interval);
          clearInterval(pingInterval);
          send("close", JSON.stringify({ reason: "max_duration" }));
          try {
            controller.close();
          } catch {
            // already closed
          }
        }
      }, MAX_SSE_DURATION_MS);

      // Cleanup on close
      req.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(interval);
        clearInterval(pingInterval);
        clearTimeout(maxDurationTimer);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
