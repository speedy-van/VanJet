// ─── VanJet · Create Job API ──────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobs, jobItems, users } from "@/lib/db/schema";
import { geocodeAddress, getDirections } from "@/lib/mapbox";
import { calculatePrice, validatePriceWithGrok } from "@/lib/pricing";
import type { PricingInput } from "@/lib/pricing";
import { sendJobConfirmation } from "@/lib/resend";
import { eq } from "drizzle-orm";

interface CreateJobBody {
  // Auth: provide customerId OR contactEmail (guest checkout)
  customerId?: string;
  contactEmail?: string;
  contactName?: string;
  contactPhone?: string;
  // Job details
  jobType: string;
  pickupAddress: string;
  deliveryAddress: string;
  moveDate: string; // ISO string
  description?: string;
  floorLevel?: number;
  hasLift?: boolean;
  needsPacking?: boolean;
  // Pickup / delivery extras
  pickupFloor?: number;
  pickupFlat?: string;
  pickupHasLift?: boolean;
  pickupNotes?: string;
  deliveryFloor?: number;
  deliveryFlat?: string;
  deliveryHasLift?: boolean;
  deliveryNotes?: string;
  // Schedule
  preferredTimeWindow?: string;
  flexibleDates?: boolean;
  // Items
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

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateJobBody;

    // ── Validate required fields ──────────────────────────────
    if (!body.customerId && !body.contactEmail) {
      return NextResponse.json(
        { error: "Customer ID or contact email is required." },
        { status: 400 }
      );
    }
    if (!body.pickupAddress || !body.deliveryAddress) {
      return NextResponse.json(
        { error: "Both pickup and delivery addresses are required." },
        { status: 400 }
      );
    }
    if (!body.moveDate) {
      return NextResponse.json(
        { error: "Move date is required." },
        { status: 400 }
      );
    }
    if (!body.jobType) {
      return NextResponse.json(
        { error: "Job type is required." },
        { status: 400 }
      );
    }

    const moveDate = new Date(body.moveDate);
    if (isNaN(moveDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid move date format. Use ISO 8601." },
        { status: 400 }
      );
    }

    // ── Resolve customer (existing ID or find/create by email) ─
    let customerId = body.customerId;
    let customerEmail = "";

    if (customerId) {
      const [customer] = await db
        .select()
        .from(users)
        .where(eq(users.id, customerId))
        .limit(1);

      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found." },
          { status: 404 }
        );
      }
      customerEmail = customer.email;
    } else if (body.contactEmail) {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, body.contactEmail))
        .limit(1);

      if (existing) {
        customerId = existing.id;
        customerEmail = existing.email;
      } else {
        const [newUser] = await db
          .insert(users)
          .values({
            email: body.contactEmail,
            name: body.contactName || "Guest",
            phone: body.contactPhone || null,
            role: "customer",
          })
          .returning();
        customerId = newUser.id;
        customerEmail = newUser.email;
      }
    }

    // ── Geocode addresses ─────────────────────────────────────
    const [pickup, delivery] = await Promise.all([
      geocodeAddress(body.pickupAddress),
      geocodeAddress(body.deliveryAddress),
    ]);

    // ── Calculate distance ────────────────────────────────────
    const directions = await getDirections(
      { lat: pickup.lat, lng: pickup.lng },
      { lat: delivery.lat, lng: delivery.lng }
    );

    // ── Compute totals from items ─────────────────────────────
    const itemsArr = body.items ?? [];
    const totalWeightKg = itemsArr.reduce(
      (sum, i) => sum + (i.weightKg ?? 10) * (i.quantity ?? 1),
      0
    );
    const totalVolumeM3 = itemsArr.reduce(
      (sum, i) => sum + (i.volumeM3 ?? 0.05) * (i.quantity ?? 1),
      0
    );

    // ── Pricing via hybrid engine ────────────────────────────────
    const pricingInput: PricingInput = {
      jobType: body.jobType,
      distanceKm: directions.distanceKm,
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
      preferredDate: moveDate,
      requestedAt: new Date(),
    };

    const engineResult = calculatePrice(pricingInput);

    // Optional AI validation + blending
    let finalTotal = engineResult.totalPrice;
    let finalMin = engineResult.priceMin;
    let finalMax = engineResult.priceMax;
    let explanation = `Estimated based on ${directions.distanceKm.toFixed(1)} km distance, ${totalWeightKg.toFixed(1)} kg total weight, and ${itemsArr.reduce((s, i) => s + (i.quantity ?? 1), 0)} items.`;

    const aiResult = await validatePriceWithGrok(pricingInput, engineResult);
    if (aiResult?.adjustedPrice != null && aiResult.adjustedPrice > 0) {
      const diff = Math.abs(aiResult.adjustedPrice - engineResult.totalPrice);
      if (diff > engineResult.totalPrice * 0.2) {
        finalTotal = Math.round((engineResult.totalPrice * 0.6 + aiResult.adjustedPrice * 0.4) * 100) / 100;
        finalMin = Math.round((finalTotal * 0.85) / 5) * 5;
        finalMax = Math.round((finalTotal * 1.15) / 5) * 5;
      }
      if (aiResult.aiExplanation) explanation = aiResult.aiExplanation;
    }

    const estimatedPrice = finalTotal;

    // ── Insert job ────────────────────────────────────────────
    const [newJob] = await db
      .insert(jobs)
      .values({
        customerId: customerId!,
        jobType: body.jobType,
        pickupAddress: pickup.placeName,
        pickupLat: String(pickup.lat),
        pickupLng: String(pickup.lng),
        deliveryAddress: delivery.placeName,
        deliveryLat: String(delivery.lat),
        deliveryLng: String(delivery.lng),
        distanceKm: String(directions.distanceKm),
        moveDate,
        description: body.description ?? null,
        estimatedPrice: String(estimatedPrice),
        floorLevel: body.floorLevel ?? null,
        hasLift: body.hasLift ?? false,
        needsPacking: body.needsPacking ?? false,
        // Pickup extras
        pickupFloor: body.pickupFloor ?? null,
        pickupFlat: body.pickupFlat ?? null,
        pickupHasLift: body.pickupHasLift ?? null,
        pickupNotes: body.pickupNotes ?? null,
        // Delivery extras
        deliveryFloor: body.deliveryFloor ?? null,
        deliveryFlat: body.deliveryFlat ?? null,
        deliveryHasLift: body.deliveryHasLift ?? null,
        deliveryNotes: body.deliveryNotes ?? null,
        // Schedule
        preferredTimeWindow: body.preferredTimeWindow ?? null,
        flexibleDates: body.flexibleDates ?? false,
        // Contact
        contactName: body.contactName ?? null,
        contactPhone: body.contactPhone ?? null,
      })
      .returning();

    // ── Insert items ──────────────────────────────────────────
    if (itemsArr.length > 0) {
      await db.insert(jobItems).values(
        itemsArr.map((item) => ({
          jobId: newJob.id,
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

    // ── Send email confirmation (fire-and-forget) ─────────────
    if (customerEmail) {
      sendJobConfirmation({
        to: customerEmail,
        customerName: body.contactName || "Customer",
        jobId: newJob.id,
        pickup: pickup.placeName,
        delivery: delivery.placeName,
        moveDate: moveDate.toLocaleDateString("en-GB", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        estimatedPrice: estimatedPrice.toFixed(2),
      }).catch((err) =>
        console.error("[VanJet] Email send failed:", err)
      );
    }

    // ── Response ──────────────────────────────────────────────
    return NextResponse.json({
      jobId: newJob.id,
      estimatedPrice,
      priceRange: {
        min: finalMin,
        max: finalMax,
      },
      explanation,
      pickup: pickup.placeName,
      delivery: delivery.placeName,
      distanceKm: directions.distanceKm,
      durationMinutes: directions.durationMinutes,
    });
  } catch (err) {
    console.error("[VanJet] Create job error:", err);
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
