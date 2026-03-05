// ─── VanJet · Admin Refund API ────────────────────────────────
// POST /api/admin/refund
// Admin-only: issues a full or partial Stripe refund for a booking.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { bookings, jobs, users, adminAuditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getStripe } from "@/lib/stripe";
import { sendRefundNotification } from "@/lib/resend";
import { sendRefundSMS } from "@/lib/sms";

interface RefundBody {
  bookingId: string;
  amountPounds?: number; // omit for full refund
  reason?: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user?.id ||
      (session.user as { role?: string }).role !== "admin"
    ) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const body = (await req.json()) as RefundBody;

    if (!body.bookingId) {
      return NextResponse.json({ error: "Booking ID is required." }, { status: 400 });
    }

    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, body.bookingId))
      .limit(1);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (!booking.stripePaymentIntentId) {
      return NextResponse.json(
        { error: "No payment intent found for this booking." },
        { status: 400 }
      );
    }

    if (booking.paymentStatus === "refunded") {
      return NextResponse.json(
        { error: "This booking has already been fully refunded." },
        { status: 400 }
      );
    }

    // ── Issue Stripe refund ─────────────────────────────────
    const stripe = getStripe();
    const refundParams: Record<string, unknown> = {
      payment_intent: booking.stripePaymentIntentId,
      reason: "requested_by_customer" as const,
    };

    const isPartialRefund = body.amountPounds != null && body.amountPounds > 0;
    if (isPartialRefund) {
      refundParams.amount = Math.round(body.amountPounds! * 100);
    }

    const refund = await stripe.refunds.create(
      refundParams as Parameters<typeof stripe.refunds.create>[0]
    );

    const isFullRefund = !isPartialRefund;
    const refundedPounds = isPartialRefund
      ? body.amountPounds!.toFixed(2)
      : (Number(booking.finalPrice) || 0).toFixed(2);

    // ── Update booking ──────────────────────────────────────
    await db
      .update(bookings)
      .set({
        paymentStatus: isFullRefund ? "refunded" : "partially_refunded",
        status: isFullRefund ? "cancelled" : booking.status,
        cancelledAt: isFullRefund ? new Date() : booking.cancelledAt,
        cancelledReason: body.reason || (isFullRefund ? "Full refund by admin." : `Partial refund of £${refundedPounds} by admin.`),
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, body.bookingId));

    // Cancel job if full refund
    if (isFullRefund) {
      await db
        .update(jobs)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(jobs.id, booking.jobId));
    }

    // ── Audit log ───────────────────────────────────────────
    await db.insert(adminAuditLogs).values({
      adminUserId: (session.user as { id: string }).id,
      bookingId: body.bookingId,
      action: "CANCEL",
      note: body.reason || `Refund issued: £${refundedPounds}`,
      diffJson: JSON.stringify({
        refundId: refund.id,
        amountRefunded: refundedPounds,
        isFullRefund,
        previousPaymentStatus: booking.paymentStatus,
      }),
    });

    // ── Notify customer ─────────────────────────────────────
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

      if (customer?.email) {
        sendRefundNotification({
          to: customer.email,
          name: customer.name,
          bookingId: body.bookingId,
          amount: refundedPounds,
          isFullRefund,
        }).catch((e) => console.error("[VanJet] Refund email error:", e));
      }
      if (customer?.phone) {
        sendRefundSMS(customer.phone, refundedPounds, isFullRefund).catch((e) =>
          console.error("[VanJet] Refund SMS error:", e)
        );
      }
    }

    return NextResponse.json({
      refunded: true,
      refundId: refund.id,
      amount: refundedPounds,
      isFullRefund,
    });
  } catch (err) {
    console.error("[VanJet] Admin refund error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
