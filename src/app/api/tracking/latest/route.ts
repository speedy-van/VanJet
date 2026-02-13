// ─── VanJet · Latest Tracking Snapshot ────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, bookingTrackingEvents, jobs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Missing token parameter." },
      { status: 400 }
    );
  }

  // Validate token and get booking + job
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.trackingToken, token))
    .limit(1);

  if (!booking) {
    return NextResponse.json(
      { error: "Invalid tracking token." },
      { status: 404 }
    );
  }

  if (!booking.trackingEnabled) {
    return NextResponse.json(
      { error: "Tracking is disabled for this booking." },
      { status: 403 }
    );
  }

  // Get job for pickup/delivery coords
  const [job] = await db
    .select({
      pickupAddress: jobs.pickupAddress,
      pickupLat: jobs.pickupLat,
      pickupLng: jobs.pickupLng,
      deliveryAddress: jobs.deliveryAddress,
      deliveryLat: jobs.deliveryLat,
      deliveryLng: jobs.deliveryLng,
    })
    .from(jobs)
    .where(eq(jobs.id, booking.jobId))
    .limit(1);

  // Get latest tracking event
  const [latest] = await db
    .select()
    .from(bookingTrackingEvents)
    .where(eq(bookingTrackingEvents.bookingId, booking.id))
    .orderBy(desc(bookingTrackingEvents.recordedAt))
    .limit(1);

  return NextResponse.json({
    bookingId: booking.id,
    status: booking.status,
    pickup: job
      ? {
          address: job.pickupAddress,
          lat: job.pickupLat ? Number(job.pickupLat) : null,
          lng: job.pickupLng ? Number(job.pickupLng) : null,
        }
      : null,
    delivery: job
      ? {
          address: job.deliveryAddress,
          lat: job.deliveryLat ? Number(job.deliveryLat) : null,
          lng: job.deliveryLng ? Number(job.deliveryLng) : null,
        }
      : null,
    latestEvent: latest
      ? {
          lat: Number(latest.lat),
          lng: Number(latest.lng),
          heading: latest.heading,
          speedKph: latest.speedKph ? Number(latest.speedKph) : null,
          accuracyM: latest.accuracyM,
          status: latest.status,
          recordedAt: latest.recordedAt.toISOString(),
        }
      : null,
  });
}
