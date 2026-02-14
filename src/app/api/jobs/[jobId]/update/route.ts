// ─── VanJet · Update Job API ──────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobs, jobItems } from "@/lib/db/schema";
import { geocodeAddress, getDirections } from "@/lib/mapbox";
import { calculatePrice, validatePriceWithGrok } from "@/lib/pricing";
import type { PricingInput } from "@/lib/pricing";
import { sendJobConfirmation } from "@/lib/resend";
import { sendDriverNewJobSMS } from "@/lib/sms";
import { eq } from "drizzle-orm";
import { driverProfiles, users } from "@/lib/db/schema";

interface UpdateJobBody {
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  description?: string;
  floorLevel?: number;
  hasLift?: boolean;
  needsPacking?: boolean;
  // Address updates (for confirmed addresses)
  pickupAddress?: string;
  pickupLat?: number;
  pickupLng?: number;
  deliveryAddress?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  // Floor/access details
  pickupFloor?: number;
  pickupFlat?: string;
  pickupHasLift?: boolean;
  pickupNotes?: string;
  deliveryFloor?: number;
  deliveryFlat?: string;
  deliveryHasLift?: boolean;
  deliveryNotes?: string;
  preferredTimeWindow?: string;
  flexibleDates?: boolean;
  items?: {
    name: string;
    category?: string;
    quantity?: number;
    weightKg?: number;
    volumeM3?: number;
    requiresDismantling?: boolean;
    specialHandling?: string;
    fragile?: boolean;
    notes?: string;
  }[];
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const body = (await req.json()) as UpdateJobBody;

    // Fetch existing job
    const [existingJob] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!existingJob) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    // Prepare items for pricing
    const itemsArr = body.items ?? [];
    const totalWeightKg = itemsArr.reduce(
      (sum, i) => sum + (i.weightKg ?? 10) * (i.quantity ?? 1),
      0
    );
    const totalVolumeM3 = itemsArr.reduce(
      (sum, i) => sum + (i.volumeM3 ?? 0.05) * (i.quantity ?? 1),
      0
    );

    // Get distance from existing job data
    const distanceMiles = Number(existingJob.distanceKm) || 10;

    // Calculate pricing
    const pricingInput: PricingInput = {
      jobType: existingJob.jobType,
      distanceMiles,
      items: itemsArr.map((i) => ({
        name: i.name,
        quantity: i.quantity ?? 1,
        weightKg: i.weightKg ?? 10,
        volumeM3: i.volumeM3 ?? 0.05,
      })),
      pickupFloor: body.pickupFloor ?? body.floorLevel ?? 0,
      pickupHasElevator: body.pickupHasLift ?? body.hasLift ?? false,
      deliveryFloor: body.deliveryFloor ?? 0,
      deliveryHasElevator: body.deliveryHasLift ?? false,
      requiresPackaging: body.needsPacking ?? false,
      requiresAssembly: false,
      requiresDisassembly: false,
      requiresCleaning: false,
      insuranceLevel: "basic",
      preferredDate: existingJob.moveDate,
      requestedAt: new Date(),
    };

    const engineResult = calculatePrice(pricingInput);

    let finalTotal = engineResult.totalPrice;
    let finalMin = engineResult.priceMin;
    let finalMax = engineResult.priceMax;
    let explanation = `Estimated based on ${distanceMiles.toFixed(1)} mile distance, ${totalWeightKg.toFixed(1)} kg total weight, and ${itemsArr.reduce((s, i) => s + (i.quantity ?? 1), 0)} items.`;

    const aiResult = await validatePriceWithGrok(pricingInput, engineResult);
    if (aiResult?.adjustedPrice != null && aiResult.adjustedPrice > 0) {
      const diff = Math.abs(aiResult.adjustedPrice - engineResult.totalPrice);
      if (diff > engineResult.totalPrice * 0.2) {
        finalTotal =
          Math.round(
            (engineResult.totalPrice * 0.6 + aiResult.adjustedPrice * 0.4) *
              100
          ) / 100;
        finalMin = Math.round((finalTotal * 0.85) / 5) * 5;
        finalMax = Math.round((finalTotal * 1.15) / 5) * 5;
      }
      if (aiResult.aiExplanation) explanation = aiResult.aiExplanation;
    }

    const estimatedPrice = finalTotal;

    // Update job (include address fields if provided)
    const updateData: Record<string, unknown> = {
      estimatedPrice: String(estimatedPrice),
      description: body.description ?? null,
      floorLevel: body.floorLevel ?? null,
      hasLift: body.hasLift ?? false,
      needsPacking: body.needsPacking ?? false,
      pickupFloor: body.pickupFloor ?? null,
      pickupFlat: body.pickupFlat ?? null,
      pickupHasLift: body.pickupHasLift ?? null,
      pickupNotes: body.pickupNotes ?? null,
      deliveryFloor: body.deliveryFloor ?? null,
      deliveryFlat: body.deliveryFlat ?? null,
      deliveryHasLift: body.deliveryHasLift ?? null,
      deliveryNotes: body.deliveryNotes ?? null,
      preferredTimeWindow: body.preferredTimeWindow ?? null,
      flexibleDates: body.flexibleDates ?? false,
      contactName: body.contactName ?? null,
      contactPhone: body.contactPhone ?? null,
      updatedAt: new Date(),
    };

    // Include address updates if provided (for confirmed addresses)
    if (body.pickupAddress !== undefined) updateData.pickupAddress = body.pickupAddress;
    if (body.pickupLat !== undefined) updateData.pickupLat = String(body.pickupLat);
    if (body.pickupLng !== undefined) updateData.pickupLng = String(body.pickupLng);
    if (body.deliveryAddress !== undefined) updateData.deliveryAddress = body.deliveryAddress;
    if (body.deliveryLat !== undefined) updateData.deliveryLat = String(body.deliveryLat);
    if (body.deliveryLng !== undefined) updateData.deliveryLng = String(body.deliveryLng);

    await db
      .update(jobs)
      .set(updateData)
      .where(eq(jobs.id, jobId));

    // Delete old items and insert new ones
    if (itemsArr.length > 0) {
      await db.delete(jobItems).where(eq(jobItems.jobId, jobId));
      await db.insert(jobItems).values(
        itemsArr.map((item) => ({
          jobId: jobId,
          name: item.name,
          category: item.category ?? null,
          quantity: item.quantity ?? 1,
          weightKg: item.weightKg ? String(item.weightKg) : null,
          volumeM3: item.volumeM3 ? String(item.volumeM3) : null,
          requiresDismantling: item.requiresDismantling ?? false,
          specialHandling: item.specialHandling ?? null,
          fragile: item.fragile ?? false,
          notes: item.notes ?? null,
        }))
      );
    }

    // Send email confirmation if we have contact email
    if (body.contactEmail) {
      sendJobConfirmation({
        referenceNumber: existingJob.referenceNumber,
        to: body.contactEmail,
        customerName: body.contactName || "Customer",
        jobId: existingJob.id,
        pickup: existingJob.pickupAddress,
        delivery: existingJob.deliveryAddress,
        moveDate: existingJob.moveDate.toLocaleDateString("en-GB", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        estimatedPrice: estimatedPrice.toFixed(2),
      }).catch((err) => console.error("[VanJet] Email send failed:", err));
    }

    // Notify eligible drivers
    notifyEligibleDrivers(
      existingJob.id,
      existingJob.pickupAddress,
      existingJob.deliveryAddress,
      Number(existingJob.pickupLat),
      Number(existingJob.pickupLng)
    ).catch((err) => console.error("[VanJet] Driver notify error:", err));

    return NextResponse.json({
      jobId: existingJob.id,
      referenceNumber: existingJob.referenceNumber,
      estimatedPrice,
      priceRange: {
        min: finalMin,
        max: finalMax,
      },
      explanation,
      pickup: existingJob.pickupAddress,
      delivery: existingJob.deliveryAddress,
      distanceMiles,
      durationMinutes: 0, // Calculate if needed
    });
  } catch (err) {
    console.error("[VanJet] Update job error:", err);
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function notifyEligibleDrivers(
  jobId: string,
  pickup: string,
  delivery: string,
  pickupLat: number,
  pickupLng: number
) {
  const allDrivers = await db
    .select({
      userId: driverProfiles.userId,
      baseLat: driverProfiles.baseLat,
      baseLng: driverProfiles.baseLng,
      coverageRadius: driverProfiles.coverageRadius,
      applicationStatus: driverProfiles.applicationStatus,
    })
    .from(driverProfiles)
    .where(eq(driverProfiles.applicationStatus, "approved"));

  for (const d of allDrivers) {
    if (d.baseLat && d.baseLng) {
      const dist = haversine(
        Number(d.baseLat),
        Number(d.baseLng),
        pickupLat,
        pickupLng
      );
      if (dist > (d.coverageRadius ?? 50)) continue;
    }

    const [user] = await db
      .select({ phone: users.phone })
      .from(users)
      .where(eq(users.id, d.userId))
      .limit(1);

    if (user?.phone) {
      sendDriverNewJobSMS(user.phone, pickup, delivery).catch(() => {});
    }
  }
}

function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
