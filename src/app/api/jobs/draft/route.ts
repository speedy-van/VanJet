// ─── VanJet · Create Draft Job API ───────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobs, users } from "@/lib/db/schema";
import { geocodeAddress } from "@/lib/mapbox";
import { generateReferenceNumber } from "@/lib/reference-number";
import { eq } from "drizzle-orm";

interface CreateDraftJobBody {
  customerId?: string;
  contactEmail?: string;
  pickupAddress: string;
  deliveryAddress: string;
  moveDate?: string;
  jobType?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateDraftJobBody;

    // Validate required fields
    if (!body.pickupAddress || !body.deliveryAddress) {
      return NextResponse.json(
        { error: "Both pickup and delivery addresses are required." },
        { status: 400 }
      );
    }

    // Resolve customer - create a guest user if needed
    let customerId = body.customerId;

    if (!customerId && body.contactEmail) {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, body.contactEmail))
        .limit(1);

      if (existing) {
        customerId = existing.id;
      } else {
        const [newUser] = await db
          .insert(users)
          .values({
            email: body.contactEmail,
            name: "Guest",
            role: "customer",
          })
          .returning();
        customerId = newUser.id;
      }
    }

    if (!customerId) {
      // Create a temporary guest user for anonymous bookings
      const tempEmail = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@vanjet.temp`;
      const [guestUser] = await db
        .insert(users)
        .values({
          email: tempEmail,
          name: "Guest User",
          role: "customer",
        })
        .returning();
      customerId = guestUser.id;
    }

    // Geocode addresses
    let pickup, delivery;
    try {
      [pickup, delivery] = await Promise.all([
        geocodeAddress(body.pickupAddress),
        geocodeAddress(body.deliveryAddress),
      ]);
    } catch (geoErr) {
      console.error("[VanJet] Geocoding error:", geoErr);
      return NextResponse.json(
        { error: `Address geocoding failed: ${geoErr instanceof Error ? geoErr.message : "Unknown error"}` },
        { status: 400 }
      );
    }

    // Generate unique reference number with retry logic
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
            customerId,
            jobType: body.jobType || "house_move",
            status: "pending",
            pickupAddress: pickup.placeName,
            pickupLat: String(pickup.lat),
            pickupLng: String(pickup.lng),
            deliveryAddress: delivery.placeName,
            deliveryLat: String(delivery.lat),
            deliveryLng: String(delivery.lng),
            moveDate: body.moveDate ? new Date(body.moveDate) : new Date(),
            contactName: null,
            contactPhone: null,
          })
          .returning();

        newJob = job;
        break;
      } catch (err) {
        console.error(`[VanJet] DB insert attempt ${attempt + 1}:`, err);
        if (err instanceof Error && err.message.includes("unique")) {
          if (attempt === MAX_RETRIES - 1) {
            throw new Error(
              "Failed to generate unique reference number after multiple attempts."
            );
          }
          continue;
        } else {
          // Re-throw with more details
          const errMsg = err instanceof Error ? err.message : String(err);
          throw new Error(`Database insert failed: ${errMsg}`);
        }
      }
    }

    if (!newJob) {
      throw new Error("Failed to create draft job.");
    }

    return NextResponse.json({
      jobId: newJob.id,
      referenceNumber,
      pickup: pickup.placeName,
      delivery: delivery.placeName,
    });
  } catch (err) {
    console.error("[VanJet] Create draft job error:", err);
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error("[VanJet] Returning error response:", { error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
