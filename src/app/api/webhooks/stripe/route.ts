// ─── VanJet · Stripe Webhook Handler ───────────────────────────
// Verifies signature and handles payment events:
//   - payment_intent.succeeded  → marks booking paid, sends confirmations
//   - payment_intent.payment_failed → cancels booking, notifies customer
//   - payment_intent.canceled   → cancels booking, notifies customer
//   - charge.refunded           → marks booking refunded, notifies parties

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { serverEnv } from "@/lib/env";
import { db } from "@/lib/db";
import {
  bookings,
  jobs,
  quotes,
  users,
} from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
import { generateTrackingToken } from "@/lib/tracking/token";
import { generateOrderNumber } from "@/lib/order-number";
import {
  sendBookingConfirmation,
  sendPaymentFailedNotification,
  sendRefundNotification,
} from "@/lib/resend";
import { sendBookingConfirmedSMS, sendPaymentFailedSMS, sendRefundSMS } from "@/lib/sms";
import { emitNewOrder } from "@/lib/events/newOrderEventBus";

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

  // ── Route events to handlers ────────────────────────────────
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        return await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);

      case "payment_intent.payment_failed":
        return await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);

      case "payment_intent.canceled":
        return await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);

      case "charge.refunded":
        return await handleChargeRefunded(event.data.object as Stripe.Charge);

      default:
        return NextResponse.json({ received: true }, { status: 200 });
    }
  } catch (err) {
    console.error("[VanJet] Stripe webhook processing error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// ── Helpers ─────────────────────────────────────────────────────

function formatDate(d: unknown): string {
  return d instanceof Date ? d.toLocaleDateString("en-GB") : String(d);
}

/** Find a booking by paymentIntentId, or by jobId + quoteId metadata. */
async function findBookingByIntent(
  paymentIntentId: string,
  jobId?: string,
  quoteId?: string
) {
  // 1. Try by stripePaymentIntentId
  const [byIntent] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.stripePaymentIntentId, paymentIntentId))
    .limit(1);
  if (byIntent) return byIntent;

  // 2. Try by jobId + quoteId
  if (jobId && quoteId) {
    const [byQuote] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.jobId, jobId), eq(bookings.quoteId, quoteId)))
      .limit(1);
    if (byQuote) return byQuote;
  }

  // 3. Try by jobId only
  if (jobId) {
    const [byJob] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.jobId, jobId))
      .limit(1);
    if (byJob) return byJob;
  }

  return null;
}

// ── payment_intent.succeeded ────────────────────────────────────

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const paymentIntentId = paymentIntent.id;
  const metadata = (paymentIntent.metadata ?? {}) as Record<string, string>;
  const jobId = metadata.jobId;
  const quoteId = metadata.quoteId;

  if (!jobId) {
    console.warn("[VanJet] Stripe webhook: payment_intent.succeeded missing metadata.jobId");
    return NextResponse.json({ received: true }, { status: 200 });
  }

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
            moveDate: formatDate(job.moveDate),
            price: booking.finalPrice,
          }).catch((e) => console.error("[VanJet] Webhook booking email error:", e));
        }
        if (driver?.phone) {
          sendBookingConfirmedSMS(
            driver.phone,
            booking.id,
            formatDate(job.moveDate)
          ).catch((e) => console.error("[VanJet] Webhook booking SMS error:", e));
        }
      }
      if (customer?.email) {
        sendBookingConfirmation({
          to: customer.email,
          name: customer.name,
          bookingId: booking.id,
          moveDate: formatDate(job.moveDate),
          price: booking.finalPrice,
        }).catch((e) => console.error("[VanJet] Webhook booking email error:", e));
      }

      return NextResponse.json({ received: true, bookingId: booking.id }, { status: 200 });
    }
  }

  // ── Direct booking flow: no quote, create booking ──
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

  // Emit new order event for admin real-time notifications
  emitNewOrder({
    id: newBooking.id,
    orderNumber,
    serviceType: job.jobType,
    pickupPostcode: job.pickupAddress,
    deliveryPostcode: job.deliveryAddress,
    finalPrice: parseFloat(finalPrice),
    createdAt: new Date(),
  });

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
      moveDate: formatDate(job.moveDate),
      price: finalPrice,
    }).catch((e) => console.error("[VanJet] Webhook booking email error:", e));
  }

  return NextResponse.json({ received: true, bookingId: newBooking.id }, { status: 200 });
}

// ── payment_intent.payment_failed ───────────────────────────────

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const paymentIntentId = paymentIntent.id;
  const metadata = (paymentIntent.metadata ?? {}) as Record<string, string>;
  const jobId = metadata.jobId;
  const quoteId = metadata.quoteId;
  const failureMessage =
    paymentIntent.last_payment_error?.message ?? "Payment was declined.";

  console.warn(
    `[VanJet] Payment failed for PI ${paymentIntentId}:`,
    failureMessage
  );

  // Find and update the booking
  const booking = await findBookingByIntent(paymentIntentId, jobId, quoteId);
  if (booking) {
    await db
      .update(bookings)
      .set({
        paymentStatus: "failed",
        stripePaymentIntentId: paymentIntentId,
        cancelledAt: new Date(),
        cancelledReason: `Payment failed: ${failureMessage}`,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, booking.id));
  }

  // Revert job status so it can be re-attempted
  if (jobId) {
    // Revert to "quoted" if there are pending/accepted quotes, else "pending"
    const existingQuotes = await db
      .select()
      .from(quotes)
      .where(eq(quotes.jobId, jobId))
      .limit(1);
    const revertStatus = existingQuotes.length > 0 ? "quoted" : "pending";

    await db
      .update(jobs)
      .set({ status: revertStatus, updatedAt: new Date() })
      .where(eq(jobs.id, jobId));

    // Notify customer
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
    if (job) {
      const [customer] = await db
        .select()
        .from(users)
        .where(eq(users.id, job.customerId))
        .limit(1);

      if (customer?.email) {
        sendPaymentFailedNotification({
          to: customer.email,
          name: customer.name,
          jobId,
          reason: failureMessage,
        }).catch((e) =>
          console.error("[VanJet] Payment failed email error:", e)
        );
      }
      if (customer?.phone) {
        sendPaymentFailedSMS(customer.phone, failureMessage).catch((e) =>
          console.error("[VanJet] Payment failed SMS error:", e)
        );
      }
    }
  }

  return NextResponse.json({ received: true, event: "payment_failed" }, { status: 200 });
}

// ── payment_intent.canceled ─────────────────────────────────────

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  const paymentIntentId = paymentIntent.id;
  const metadata = (paymentIntent.metadata ?? {}) as Record<string, string>;
  const jobId = metadata.jobId;
  const quoteId = metadata.quoteId;

  console.info(`[VanJet] PaymentIntent canceled: ${paymentIntentId}`);

  const booking = await findBookingByIntent(paymentIntentId, jobId, quoteId);
  if (booking && booking.paymentStatus !== "paid") {
    await db
      .update(bookings)
      .set({
        status: "cancelled",
        paymentStatus: "cancelled",
        cancelledAt: new Date(),
        cancelledReason: "Payment was cancelled before completion.",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, booking.id));
  }

  // Revert job status
  if (jobId) {
    const existingQuotes = await db
      .select()
      .from(quotes)
      .where(eq(quotes.jobId, jobId))
      .limit(1);
    const revertStatus = existingQuotes.length > 0 ? "quoted" : "pending";
    await db
      .update(jobs)
      .set({ status: revertStatus, updatedAt: new Date() })
      .where(eq(jobs.id, jobId));
  }

  return NextResponse.json({ received: true, event: "payment_canceled" }, { status: 200 });
}

// ── charge.refunded ─────────────────────────────────────────────

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!paymentIntentId) {
    console.warn("[VanJet] charge.refunded: missing payment_intent on charge", charge.id);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // Find booking by paymentIntentId
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.stripePaymentIntentId, paymentIntentId))
    .limit(1);

  if (!booking) {
    console.warn("[VanJet] charge.refunded: no booking for PI", paymentIntentId);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // Determine partial vs full refund
  const refundedAmount = charge.amount_refunded; // in pence
  const totalAmount = charge.amount; // in pence
  const isFullRefund = refundedAmount >= totalAmount;

  await db
    .update(bookings)
    .set({
      paymentStatus: isFullRefund ? "refunded" : "partially_refunded",
      status: isFullRefund ? "cancelled" : booking.status,
      cancelledAt: isFullRefund ? new Date() : booking.cancelledAt,
      cancelledReason: isFullRefund
        ? "Full refund issued."
        : `Partial refund: £${(refundedAmount / 100).toFixed(2)} of £${(totalAmount / 100).toFixed(2)}.`,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, booking.id));

  // If full refund, cancel the job too
  if (isFullRefund && booking.jobId) {
    await db
      .update(jobs)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(jobs.id, booking.jobId));
  }

  // Notify customer and driver
  if (booking.jobId) {
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, booking.jobId))
      .limit(1);

    if (job) {
      const [customer] = await db
        .select()
        .from(users)
        .where(eq(users.id, job.customerId))
        .limit(1);

      const refundPounds = (refundedAmount / 100).toFixed(2);

      if (customer?.email) {
        sendRefundNotification({
          to: customer.email,
          name: customer.name,
          bookingId: booking.id,
          amount: refundPounds,
          isFullRefund,
        }).catch((e) => console.error("[VanJet] Refund email error:", e));
      }
      if (customer?.phone) {
        sendRefundSMS(customer.phone, refundPounds, isFullRefund).catch((e) =>
          console.error("[VanJet] Refund SMS error:", e)
        );
      }

      // Notify driver if assigned
      if (booking.driverId) {
        const [driver] = await db
          .select()
          .from(users)
          .where(eq(users.id, booking.driverId))
          .limit(1);

        if (driver?.email) {
          sendRefundNotification({
            to: driver.email,
            name: driver.name,
            bookingId: booking.id,
            amount: refundPounds,
            isFullRefund,
          }).catch((e) => console.error("[VanJet] Driver refund email error:", e));
        }
      }
    }
  }

  return NextResponse.json({ received: true, event: "charge_refunded" }, { status: 200 });
}
