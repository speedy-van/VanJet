// ─── VanJet · Create Job API ──────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobs, jobItems, users, driverProfiles } from "@/lib/db/schema";
import { geocodeAddress, getDirections } from "@/lib/mapbox";
import { calculatePrice, validatePriceWithGrok } from "@/lib/pricing";
import type { PricingInput } from "@/lib/pricing";
import { sendJobConfirmation } from "@/lib/resend";
import { sendDriverNewJobSMS } from "@/lib/sms";
import { eq } from "drizzle-orm";
import { generateReferenceNumber } from "@/lib/reference-number";

// ── Pricing Profile Configuration ──────────────────────────────────────
const PRICING_PROFILE = process.env.PRICING_PROFILE ?? "competitive";
const ENABLE_VAT = process.env.ENABLE_VAT === "true";
const PRICING_DEBUG = process.env.PRICING_DEBUG === "true";

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
      distanceMiles: directions.distanceMiles,
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

    // ── Apply pricing profile ─────────────────────────────────────
    const useCompetitiveRates = PRICING_PROFILE === "competitive";
    const engineResult = calculatePrice(pricingInput, { 
      useCompetitiveRates, 
      enableVat: ENABLE_VAT 
    });

    if (PRICING_DEBUG) {
      console.log("[JOB_CREATE_DEBUG] =====================================");
      console.log(`[JOB_CREATE_DEBUG] Profile: ${PRICING_PROFILE} | VAT: ${ENABLE_VAT}`);
      console.log(`[JOB_CREATE_DEBUG] Distance: ${directions.distanceMiles.toFixed(1)} miles`);
      console.log(`[JOB_CREATE_DEBUG] Engine result:`, {
        basePrice: engineResult.basePrice,
        distanceCost: engineResult.distanceCost,
        vehicleMultiplier: engineResult.vehicleMultiplier,
        demandMultiplier: engineResult.demandMultiplier,
        subtotal: engineResult.subtotal,
        vatAmount: engineResult.vatAmount,
        totalPrice: engineResult.totalPrice,
        priceRange: `£${engineResult.priceMin} - £${engineResult.priceMax}`,
      });
      console.log("[JOB_CREATE_DEBUG] =====================================");
    }

    // Optional AI validation + blending
    let finalTotal = engineResult.totalPrice;
    let finalMin = engineResult.priceMin;
    let finalMax = engineResult.priceMax;
    let explanation = `Estimated based on ${directions.distanceMiles.toFixed(1)} mile distance, ${totalWeightKg.toFixed(1)} kg total weight, and ${itemsArr.reduce((s, i) => s + (i.quantity ?? 1), 0)} items.`;

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

    // ── Insert job with retry logic for unique reference ─────
    const MAX_RETRIES = 20;
    let newJob: typeof jobs.$inferSelect | null = null;
    let referenceNumber = "";
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      referenceNumber = generateReferenceNumber();
      
      try {
        const [job] = await db
          .insert(jobs)
          .values({
            referenceNumber,
            customerId: customerId!,
            jobType: body.jobType,
            pickupAddress: pickup.placeName,
            pickupLat: String(pickup.lat),
            pickupLng: String(pickup.lng),
            deliveryAddress: delivery.placeName,
            deliveryLat: String(delivery.lat),
            deliveryLng: String(delivery.lng),
            distanceKm: String(directions.distanceMiles), // stored in miles (not km)
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
        
        newJob = job;
        break; // Success, exit retry loop
      } catch (err) {
        // Check if it's a unique constraint violation
        if (err instanceof Error && err.message.includes("unique")) {
          if (attempt === MAX_RETRIES - 1) {
            throw new Error("Failed to generate unique reference number after multiple attempts.");
          }
          // Continue to next attempt
        } else {
          // Other error, re-throw
          throw err;
        }
      }
    }

    if (!newJob) {
      throw new Error("Failed to create job.");
    }

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
      referenceNumber,
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

    // ── Notify eligible drivers (fire-and-forget) ─────────────
    notifyEligibleDrivers(
      newJob.id,
      pickup.placeName,
      delivery.placeName,
      Number(pickup.lat),
      Number(pickup.lng)
    ).catch((err) => console.error("[VanJet] Driver notify error:", err));

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
      distanceMiles: directions.distanceMiles,
      durationMinutes: directions.durationMinutes,
    });
  } catch (err) {
    console.error("[VanJet] Create job error:", err);
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Notify approved drivers within coverage radius about a new job */
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
    // Filter by coverage if driver has base coordinates
    if (d.baseLat && d.baseLng) {
      const dist = haversine(
        Number(d.baseLat), Number(d.baseLng),
        pickupLat, pickupLng
      );
      if (dist > (d.coverageRadius ?? 50)) continue;
    }

    // Fetch driver's phone for SMS
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

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}