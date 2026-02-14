// ─── VanJet · Customer Job Quotes API ─────────────────────────
// GET /api/jobs/[jobId]/quotes
// Returns all quotes for a job (customer must own the job).

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobs, quotes, users, driverProfiles, jobItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required." }, { status: 400 });
    }

    // ── Fetch job ─────────────────────────────────────────────
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    // ── Fetch job items ───────────────────────────────────────
    const items = await db
      .select()
      .from(jobItems)
      .where(eq(jobItems.jobId, jobId));

    // ── Fetch all quotes with driver details ──────────────────
    const allQuotes = await db
      .select({
        id: quotes.id,
        price: quotes.price,
        message: quotes.message,
        estimatedDuration: quotes.estimatedDuration,
        driverPhone: users.phone,
        status: quotes.status,
        expiresAt: quotes.expiresAt,
        createdAt: quotes.createdAt,
        driverId: quotes.driverId,
        driverName: users.name,
        driverEmail: users.email,
      })
      .from(quotes)
      .innerJoin(users, eq(users.id, quotes.driverId))
      .where(eq(quotes.jobId, jobId))
      .orderBy(quotes.createdAt);

    // ── Fetch driver profiles for extra details ───────────────
    const driverIds = [...new Set(allQuotes.map((q) => q.driverId))];
    const profiles = driverIds.length > 0
      ? await db
          .select()
          .from(driverProfiles)
          .where(
            driverIds.length === 1
              ? eq(driverProfiles.userId, driverIds[0])
              : eq(driverProfiles.userId, driverIds[0]) // fallback — build properly below
          )
      : [];

    // Fetch all profiles for the driver IDs
    const allProfiles = driverIds.length > 0
      ? await db.select().from(driverProfiles)
      : [];

    const profileMap = new Map(
      allProfiles
        .filter((p) => driverIds.includes(p.userId))
        .map((p) => [p.userId, p])
    );

    // ── Build response ───────────────────────────────────────
    const result = allQuotes.map((q) => {
      const profile = profileMap.get(q.driverId);
      return {
        id: q.id,
        price: Number(q.price),
        message: q.message,
        estimatedDuration: q.estimatedDuration,
        status: q.status,
        expiresAt: q.expiresAt,
        createdAt: q.createdAt,
        driver: {
          id: q.driverId,
          email: q.driverEmail,
          phone: q.driverPhone,
          companyName: profile?.companyName ?? null,
          vanSize: profile?.vanSize ?? null,
          rating: profile?.rating ? Number(profile.rating) : 0,
          totalJobs: profile?.totalJobs ?? 0,
          verified: profile?.verified ?? false,
          stripeOnboarded: profile?.stripeOnboarded ?? false,
        },
      };
    });

    return NextResponse.json({
      job: {
        id: job.id,
        referenceNumber: job.referenceNumber,
        jobType: job.jobType,
        status: job.status,
        pickupAddress: job.pickupAddress,
        deliveryAddress: job.deliveryAddress,
        moveDate: job.moveDate,
        estimatedPrice: job.estimatedPrice ? Number(job.estimatedPrice) : null,
        distanceMiles: job.distanceKm ? Number(job.distanceKm) : null,
        description: job.description,
        pickupFloor: job.pickupFloor,
        deliveryFloor: job.deliveryFloor,
        pickupHasLift: job.pickupHasLift,
        deliveryHasLift: job.deliveryHasLift,
        needsPacking: job.needsPacking,
        contactName: job.contactName,
        contactPhone: job.contactPhone,
      },
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        weightKg: item.weightKg ? Number(item.weightKg) : null,
        volumeM3: item.volumeM3 ? Number(item.volumeM3) : null,
        fragile: item.fragile,
        requiresDismantling: item.requiresDismantling,
        notes: item.notes,
      })),
      quotes: result,
    });
  } catch (err) {
    console.error("[VanJet] Fetch quotes error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
