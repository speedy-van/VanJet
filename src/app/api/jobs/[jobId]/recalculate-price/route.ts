// ─── VanJet · Recalculate Job Price API ──────────────────────
// PATCH /api/jobs/[jobId]/recalculate-price
// Updates estimatedPrice in DB using current pricing profile

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobs, jobItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { calculatePrice } from "@/lib/pricing";
import type { PricingInput } from "@/lib/pricing";

const PRICING_PROFILE = process.env.PRICING_PROFILE ?? "competitive";
const ENABLE_VAT = process.env.ENABLE_VAT === "true";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required." }, { status: 400 });
    }

    // Fetch job
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    // Fetch items
    const items = await db.select().from(jobItems).where(eq(jobItems.jobId, jobId));

    if (!job.moveDate) {
      return NextResponse.json({ error: "Job has no move date." }, { status: 400 });
    }

    // Build pricing input
    const pricingInput: PricingInput = {
      jobType: job.jobType || "single_item",
      distanceMiles: job.distanceKm ? Number(job.distanceKm) : 0,
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        weightKg: i.weightKg ? Number(i.weightKg) : 10,
        volumeM3: i.volumeM3 ? Number(i.volumeM3) : 0.05,
      })),
      pickupFloor: job.pickupFloor ?? 0,
      pickupHasElevator: job.pickupHasLift ?? false,
      deliveryFloor: job.deliveryFloor ?? 0,
      deliveryHasElevator: job.deliveryHasLift ?? false,
      requiresPackaging: job.needsPacking ?? false,
      requiresAssembly: false,
      requiresDisassembly: false,
      requiresCleaning: false,
      insuranceLevel: "basic",
      preferredDate: new Date(job.moveDate),
      requestedAt: new Date(),
    };

    // Calculate with current profile
    const useCompetitiveRates = PRICING_PROFILE === "competitive";
    const result = calculatePrice(pricingInput, {
      useCompetitiveRates,
      enableVat: ENABLE_VAT,
    });

    // Update DB
    await db
      .update(jobs)
      .set({
        estimatedPrice: String(result.totalPrice),
      })
      .where(eq(jobs.id, jobId));

    return NextResponse.json({
      jobId,
      oldPrice: job.estimatedPrice ? Number(job.estimatedPrice) : null,
      newPrice: result.totalPrice,
      priceMin: result.priceMin,
      priceMax: result.priceMax,
      profile: PRICING_PROFILE,
      vatEnabled: ENABLE_VAT,
    });
  } catch (err) {
    console.error("[VanJet] Recalculate price error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
