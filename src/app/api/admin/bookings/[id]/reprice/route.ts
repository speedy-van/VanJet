// ─── VanJet · Admin Booking Reprice API ───────────────────────
// POST /api/admin/bookings/[id]/reprice
// Recalculates the price using the existing pricing engine.
// Uses stored distance (miles); falls back to Mapbox if missing.
// Requires admin session. Writes audit log entry.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { bookings, jobs, jobItems, adminAuditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { calculatePrice } from "@/lib/pricing";
import type { PricingInput, PricingItemInput } from "@/lib/pricing";
import { getDirections } from "@/lib/mapbox";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // RBAC check
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: bookingId } = await params;

  // Fetch booking
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  if (booking.status === "cancelled") {
    return NextResponse.json(
      { error: "Cannot reprice a cancelled booking." },
      { status: 400 }
    );
  }

  // Fetch linked job
  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, booking.jobId))
    .limit(1);

  if (!job) {
    return NextResponse.json({ error: "Linked job not found." }, { status: 404 });
  }

  // Fetch items
  const items = await db
    .select()
    .from(jobItems)
    .where(eq(jobItems.jobId, booking.jobId));

  // Resolve distance (stored in miles despite legacy column name)
  let distanceMiles = job.distanceKm ? Number(job.distanceKm) : 0;

  if (distanceMiles <= 0) {
    // Try to recalculate from stored coordinates
    const hasCoords =
      job.pickupLat &&
      job.pickupLng &&
      job.deliveryLat &&
      job.deliveryLng;

    if (hasCoords) {
      try {
        const directions = await getDirections(
          { lat: Number(job.pickupLat), lng: Number(job.pickupLng) },
          { lat: Number(job.deliveryLat), lng: Number(job.deliveryLng) }
        );
        distanceMiles = directions.distanceMiles;

        // Store recalculated distance on job (miles, legacy column name)
        await db
          .update(jobs)
          .set({ distanceKm: String(distanceMiles), updatedAt: new Date() })
          .where(eq(jobs.id, job.id));
      } catch {
        // Fallback: use a default distance if Mapbox fails
        distanceMiles = 10;
      }
    } else {
      distanceMiles = 10; // Default fallback
    }
  }

  // Build pricing input from job data
  const pricingItems: PricingItemInput[] = items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    weightKg: item.weightKg ? Number(item.weightKg) : 5,
    volumeM3: item.volumeM3 ? Number(item.volumeM3) : 0.1,
  }));

  // Ensure at least one item for pricing
  if (pricingItems.length === 0) {
    pricingItems.push({
      name: "General items",
      quantity: 1,
      weightKg: 10,
      volumeM3: 0.5,
    });
  }

  const pricingInput: PricingInput = {
    jobType: job.jobType,
    distanceMiles,
    items: pricingItems,
    pickupFloor: job.pickupFloor ?? 0,
    pickupHasElevator: job.pickupHasLift ?? false,
    deliveryFloor: job.deliveryFloor ?? 0,
    deliveryHasElevator: job.deliveryHasLift ?? false,
    requiresPackaging: job.needsPacking ?? false,
    requiresAssembly: false,
    requiresDisassembly: items.some((i) => i.requiresDismantling),
    requiresCleaning: false,
    insuranceLevel: "basic",
    preferredDate: new Date(job.moveDate),
    requestedAt: new Date(job.createdAt),
  };

  // Calculate new price
  const breakdown = calculatePrice(pricingInput);

  const oldPrice = Number(booking.finalPrice);
  const newPrice = breakdown.totalPrice;
  const now = new Date();

  // Update booking with new price and breakdown
  await db
    .update(bookings)
    .set({
      finalPrice: String(newPrice),
      priceBreakdown: JSON.stringify(breakdown),
      repricedAt: now,
      repricedBy: session.user.id,
      updatedAt: now,
    })
    .where(eq(bookings.id, bookingId));

  // Also update job estimated/final price
  await db
    .update(jobs)
    .set({
      estimatedPrice: String(newPrice),
      updatedAt: now,
    })
    .where(eq(jobs.id, booking.jobId));

  // Write audit log
  await db.insert(adminAuditLogs).values({
    adminUserId: session.user.id,
    bookingId,
    action: "REPRICE",
    diffJson: JSON.stringify({
      finalPrice: { old: oldPrice, new: newPrice },
      breakdown: {
        basePrice: breakdown.basePrice,
        distanceCost: breakdown.distanceCost,
        floorCost: breakdown.floorCost,
        extraServices: breakdown.extraServices,
        demandMultiplier: breakdown.demandMultiplier,
        vehicleMultiplier: breakdown.vehicleMultiplier,
        subtotal: breakdown.subtotal,
        vatAmount: breakdown.vatAmount,
        totalPrice: breakdown.totalPrice,
        recommendedVehicle: breakdown.recommendedVehicle,
      },
    }),
  });

  return NextResponse.json({
    success: true,
    oldPrice,
    newPrice,
    breakdown,
  });
}
