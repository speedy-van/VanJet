// ─── VanJet · Create Payment Intent API ──────────────────────
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobs, quotes, driverProfiles, users } from "@/lib/db/schema";
import { createPaymentIntent } from "@/lib/stripe";
import { eq } from "drizzle-orm";

interface CreateIntentBody {
  jobId: string;
  quoteId?: string; // optional — omit for direct booking
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateIntentBody;

    // ── Validate inputs ───────────────────────────────────────
    if (!body.jobId) {
      return NextResponse.json(
        { error: "Job ID is required." },
        { status: 400 }
      );
    }

    // ── Fetch the job ─────────────────────────────────────────
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, body.jobId))
      .limit(1);

    if (!job) {
      return NextResponse.json(
        { error: "Job not found." },
        { status: 404 }
      );
    }

    // ── Path A: Quote-based payment (with driver) ─────────────
    if (body.quoteId) {
      const [quote] = await db
        .select()
        .from(quotes)
        .where(eq(quotes.id, body.quoteId))
        .limit(1);

      if (!quote) {
        return NextResponse.json(
          { error: "Quote not found." },
          { status: 404 }
        );
      }

      if (quote.jobId !== body.jobId) {
        return NextResponse.json(
          { error: "Quote does not belong to this job." },
          { status: 400 }
        );
      }

      const pricePounds = parseFloat(quote.price);
      if (!pricePounds || pricePounds <= 0) {
        return NextResponse.json(
          { error: "Invalid price on this quote." },
          { status: 400 }
        );
      }

      const [driverProfile] = await db
        .select()
        .from(driverProfiles)
        .where(eq(driverProfiles.userId, quote.driverId))
        .limit(1);

      if (!driverProfile?.stripeAccountId) {
        return NextResponse.json(
          {
            error:
              "This driver has not completed Stripe onboarding. Please choose another quote or ask the driver to set up payments.",
          },
          { status: 400 }
        );
      }

      const amountPence = Math.round(pricePounds * 100);

      // Fetch driver details
      const [driver] = await db
        .select()
        .from(users)
        .where(eq(users.id, quote.driverId))
        .limit(1);

      const { clientSecret, paymentIntentId } =
        await createPaymentIntent({
          amountPence,
          driverStripeAccountId: driverProfile.stripeAccountId,
          metadata: {
            jobId: body.jobId,
            quoteId: body.quoteId,
            driverId: quote.driverId,
          },
        });

      return NextResponse.json({
        clientSecret,
        paymentIntentId,
        amountPence,
        driverStripeAccountId: driverProfile.stripeAccountId,
        job: {
          id: job.id,
          referenceNumber: job.referenceNumber,
          pickupAddress: job.pickupAddress,
          deliveryAddress: job.deliveryAddress,
          moveDate: job.moveDate,
          distanceMiles: job.distanceKm ? Number(job.distanceKm) : null,
        },
        quote: {
          id: quote.id,
          price: pricePounds,
          driverName: driver?.name || "Driver",
          driverCompany: driverProfile.companyName,
          vanSize: driverProfile.vanSize,
        },
      });
    }

    // ── Path B: Direct booking (platform holds funds) ─────────
    const estimatedPrice = parseFloat(job.estimatedPrice ?? "0");
    if (estimatedPrice <= 0) {
      return NextResponse.json(
        { error: "No valid estimated price for this job." },
        { status: 400 }
      );
    }

    const amountPence = Math.round(estimatedPrice * 100);

    const { clientSecret, paymentIntentId } =
      await createPaymentIntent({
        amountPence,
        metadata: { jobId: body.jobId },
      });

    return NextResponse.json({
      clientSecret,
      paymentIntentId,
      amountPence,
    });
  } catch (err) {
    console.error("[VanJet] Create payment intent error:", err);
    const message =
      err instanceof Error
        ? err.message
        : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
