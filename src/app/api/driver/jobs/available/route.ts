// ─── VanJet · Driver Available Jobs API ───────────────────────
// GET /api/driver/jobs/available
// Returns pending/quoted jobs that match driver profile.
// Auth: driver role required.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { jobs, jobItems, driverProfiles, quotes } from "@/lib/db/schema";
import { eq, and, inArray, ne, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !["driver", "admin"].includes((session.user as { role?: string }).role ?? "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    // ── Fetch driver profile ────────────────────────────────────
    const [profile] = await db
      .select()
      .from(driverProfiles)
      .where(eq(driverProfiles.userId, userId))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ error: "Driver profile not found." }, { status: 404 });
    }

    if (profile.applicationStatus !== "approved") {
      return NextResponse.json({ error: "Your application is still pending approval." }, { status: 403 });
    }

    // ── Fetch available jobs (pending or quoted) ────────────────
    const availableJobs = await db
      .select()
      .from(jobs)
      .where(inArray(jobs.status, ["pending", "quoted"]))
      .orderBy(sql`${jobs.createdAt} DESC`)
      .limit(50);

    // ── Filter by coverage radius (miles) if driver has base coords ─
    const driverLat = profile.baseLat ? Number(profile.baseLat) : null;
    const driverLng = profile.baseLng ? Number(profile.baseLng) : null;
    const maxRadius = profile.coverageRadius ?? 50; // miles

    const filtered = availableJobs.filter((job) => {
      // Must have pickup coordinates (UK validated by Mapbox)
      if (!job.pickupLat || !job.pickupLng) return false;

      // If driver has base location, check distance
      if (driverLat !== null && driverLng !== null) {
        const dist = haversineDistance(
          driverLat,
          driverLng,
          Number(job.pickupLat),
          Number(job.pickupLng)
        );
        if (dist > maxRadius) return false;
      }

      return true;
    });

    // ── Fetch existing quotes by this driver to mark already-quoted ─
    const driverQuotes = filtered.length > 0
      ? await db
          .select({ jobId: quotes.jobId })
          .from(quotes)
          .where(
            and(
              eq(quotes.driverId, userId),
              inArray(quotes.jobId, filtered.map((j) => j.id))
            )
          )
      : [];

    const quotedJobIds = new Set(driverQuotes.map((q) => q.jobId));

    // ── Fetch item counts per job ─────────────────────────────
    const jobIds = filtered.map((j) => j.id);
    const itemCounts = jobIds.length > 0
      ? await db
          .select({
            jobId: jobItems.jobId,
            count: sql<number>`count(*)::int`,
          })
          .from(jobItems)
          .where(inArray(jobItems.jobId, jobIds))
          .groupBy(jobItems.jobId)
      : [];

    const itemCountMap = new Map(itemCounts.map((ic) => [ic.jobId, ic.count]));

    // ── Build response ───────────────────────────────────────
    const result = filtered.map((job) => {
      let distanceFromDriver: number | null = null;
      if (driverLat !== null && driverLng !== null && job.pickupLat && job.pickupLng) {
        distanceFromDriver = Math.round(
          haversineDistance(driverLat, driverLng, Number(job.pickupLat), Number(job.pickupLng)) * 10
        ) / 10;
      }

      return {
        id: job.id,
        jobType: job.jobType,
        status: job.status,
        // Pickup details
        pickupAddress: job.pickupAddress,
        pickupFloor: job.pickupFloor,
        pickupFlat: job.pickupFlat,
        pickupHasLift: job.pickupHasLift,
        pickupNotes: job.pickupNotes,
        // Delivery details
        deliveryAddress: job.deliveryAddress,
        deliveryFloor: job.deliveryFloor,
        deliveryFlat: job.deliveryFlat,
        deliveryHasLift: job.deliveryHasLift,
        deliveryNotes: job.deliveryNotes,
        // Route
        distanceMiles: job.distanceKm ? Number(job.distanceKm) : null,
        durationMinutes: job.durationMinutes,
        // Schedule
        moveDate: job.moveDate,
        preferredTimeWindow: job.preferredTimeWindow,
        flexibleDates: job.flexibleDates,
        // Details
        estimatedPrice: job.estimatedPrice ? Number(job.estimatedPrice) : null,
        description: job.description,
        needsPacking: job.needsPacking,
        // Contact
        contactName: job.contactName,
        contactPhone: job.contactPhone,
        // Computed
        itemCount: itemCountMap.get(job.id) ?? 0,
        distanceFromDriver,
        alreadyQuoted: quotedJobIds.has(job.id),
        createdAt: job.createdAt,
      };
    });

    // Sort: nearest first (if distance available), then newest
    result.sort((a, b) => {
      if (a.distanceFromDriver !== null && b.distanceFromDriver !== null) {
        return a.distanceFromDriver - b.distanceFromDriver;
      }
      if (a.distanceFromDriver !== null) return -1;
      if (b.distanceFromDriver !== null) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ jobs: result });
  } catch (err) {
    console.error("[VanJet] Available jobs error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

/** Haversine distance in miles between two lat/lng pairs */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
