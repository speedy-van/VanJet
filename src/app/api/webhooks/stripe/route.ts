// ─── VanJet · Stripe Webhook Handler ───────────────────────────
// Verifies signature and handles payment_intent.succeeded.
// Marks booking as paid and sends confirmations. Uses raw body for verification.

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { serverEnv } from "@/lib/env";
import { db } from "@/lib/db";
import {
  bookings,
  jobs,
  users,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateTrackingToken } from "@/lib/tracking/token";
import { generateOrderNumber } from "@/lib/order-number";
import { sendBookingConfirmation } from "@/lib/resend";
import { sendBookingConfirmedSMS } from "@/lib/sms";

const WEBHOOK_SECRET = serverEnv.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    console.warn("[VanJet] Stripe webhook: STRIPE_WEBHOOK_SECRET not set. Skipping verification.");
    return NextResponse.json(
      { received: true, skip: "no_webhook_secret" },
      { status: 200 }
    );
  }

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json(
      { error: "Failed to read body" },
      { status: 400 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[VanJet] Stripe webhook signature verification failed:", message);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type !== "payment_intent.succeeded") {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const paymentIntentId = paymentIntent.id;
  const metadata = (paymentIntent.metadata ?? {}) as Record<string, string>;
  const jobId = metadata.jobId;
  const quoteId = metadata.quoteId;

  if (!jobId) {
    console.warn("[VanJet] Stripe webhook: payment_intent.succeeded missing metadata.jobId");
    return NextResponse.json({ received: true }, { status: 200 });
  }

  try {
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!job) {
      console.warn("[VanJet] Stripe webhook: job not found for jobId:", jobId);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // ── Quote-based flow: find existing booking by jobId + quoteId ──
    if (quoteId) {
      const [booking] = await db
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.jobId, jobId),
            eq(bookings.quoteId, quoteId)
          )
        )
        .limit(1);

      if (booking) {
        if (booking.paymentStatus === "paid") {
          return NextResponse.json({ received: true, already_paid: true }, { status: 200 });
        }

        await db
          .update(bookings)
          .set({
            stripePaymentIntentId: paymentIntentId,
            paymentStatus: "paid",
            updatedAt: new Date(),
          })
          .where(eq(bookings.id, booking.id));

        await db
          .update(jobs)
          .set({ status: "accepted", updatedAt: new Date() })
          .where(eq(jobs.id, jobId));

        const [customer] = await db
          .select()
          .from(users)
          .where(eq(users.id, job.customerId))
          .limit(1);

        if (booking.driverId) {
          const [driver] = await db
            .select()
            .from(users)
            .where(eq(users.id, booking.driverId))
            .limit(1);
          if (driver?.email) {
            sendBookingConfirmation({
              to: driver.email,
              name: driver.name,
              bookingId: booking.id,
              moveDate: job.moveDate instanceof Date ? job.moveDate.toLocaleDateString("en-GB") : String(job.moveDate),
              price: booking.finalPrice,
            }).catch((e) => console.error("[VanJet] Webhook booking email error:", e));
          }
          if (driver?.phone) {
            sendBookingConfirmedSMS(
              driver.phone,
              booking.id,
              job.moveDate instanceof Date ? job.moveDate.toLocaleDateString("en-GB") : String(job.moveDate)
            ).catch((e) => console.error("[VanJet] Webhook booking SMS error:", e));
          }
        }
        if (customer?.email) {
          sendBookingConfirmation({
            to: customer.email,
            name: customer.name,
            bookingId: booking.id,
            moveDate: job.moveDate instanceof Date ? job.moveDate.toLocaleDateString("en-GB") : String(job.moveDate),
            price: booking.finalPrice,
          }).catch((e) => console.error("[VanJet] Webhook booking email error:", e));
        }

        return NextResponse.json({ received: true, bookingId: booking.id }, { status: 200 });
      }
    }

    // ── Direct booking flow: no quote, create booking (same as mark-paid) ──
    const [existingByIntent] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.stripePaymentIntentId, paymentIntentId))
      .limit(1);

    if (existingByIntent) {
      if (existingByIntent.paymentStatus === "paid") {
        return NextResponse.json({ received: true, already_paid: true }, { status: 200 });
      }
      await db
        .update(bookings)
        .set({ paymentStatus: "paid", updatedAt: new Date() })
        .where(eq(bookings.id, existingByIntent.id));
      return NextResponse.json({ received: true, bookingId: existingByIntent.id }, { status: 200 });
    }

    await db
      .update(jobs)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(jobs.id, jobId));

    const finalPrice = job.estimatedPrice ?? "0";
    const trackingToken = generateTrackingToken();
    const orderNumber = await generateOrderNumber();

    const [newBooking] = await db
      .insert(bookings)
      .values({
        jobId: jobId,
        finalPrice,
        stripePaymentIntentId: paymentIntentId,
        paymentStatus: "paid",
        status: "confirmed",
        trackingToken,
        trackingEnabled: true,
        orderNumber,
      })
      .returning();

    const [customer] = await db
      .select()
      .from(users)
      .where(eq(users.id, job.customerId))
      .limit(1);
    if (customer?.email) {
      sendBookingConfirmation({
        to: customer.email,
        name: customer.name,
        bookingId: newBooking.id,
        moveDate: job.moveDate instanceof Date ? job.moveDate.toLocaleDateString("en-GB") : String(job.moveDate),
        price: finalPrice,
      }).catch((e) => console.error("[VanJet] Webhook booking email error:", e));
    }

    return NextResponse.json({ received: true, bookingId: newBooking.id }, { status: 200 });
  } catch (err) {
    console.error("[VanJet] Stripe webhook processing error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
