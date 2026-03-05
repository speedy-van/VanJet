// ─── VanJet · Cancel Booking API ──────────────────────────────
// POST /api/bookings/[bookingId]/cancel
// Customer or admin cancels a booking. If paid, issues a Stripe refund.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { bookings, jobs, users, adminAuditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getStripe } from "@/lib/stripe";
import { sendCancellationNotification } from "@/lib/resend";
import { sendCancellationSMS } from "@/lib/sms";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const reason = (body as { reason?: string }).reason || "Cancelled by customer.";

    // ── Fetch booking ───────────────────────────────────────
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    // ── Fetch job to verify ownership ───────────────────────
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, booking.jobId))
      .limit(1);

    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    const userRole = (session.user as { role?: string }).role ?? "customer";
    const userId = (session.user as { id: string }).id;

    // Only the customer who owns the job, the assigned driver, or an admin can cancel
    const isOwner = job.customerId === userId;
    const isDriver = booking.driverId === userId;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isDriver && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // ── Check if booking can be cancelled ───────────────────
    if (booking.status === "cancelled") {
      return NextResponse.json(
        { error: "This booking is already cancelled." },
        { status: 400 }
      );
    }

    if (booking.status === "completed") {
      return NextResponse.json(
        { error: "Cannot cancel a completed booking." },
        { status: 400 }
      );
    }

    // ── Issue Stripe refund if paid ─────────────────────────
    let refundIssued = false;
    let refundId: string | null = null;

    if (
      booking.paymentStatus === "paid" &&
      booking.stripePaymentIntentId
    ) {
      try {
        const stripe = getStripe();
        const refund = await stripe.refunds.create({
          payment_intent: booking.stripePaymentIntentId,
          reason: "requested_by_customer",
        });
        refundIssued = true;
        refundId = refund.id;
      } catch (refundErr) {
        console.error("[VanJet] Stripe refund error:", refundErr);
        return NextResponse.json(
          {
            error:
              "Failed to process refund. Please contact support.",
          },
          { status: 500 }
        );
      }
    }

    // ── Update booking ──────────────────────────────────────
    await db
      .update(bookings)
      .set({
        status: "cancelled",
        paymentStatus: refundIssued ? "refunded" : booking.paymentStatus,
        cancelledAt: new Date(),
        cancelledReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    // ── Update job status ───────────────────────────────────
    await db
      .update(jobs)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(jobs.id, booking.jobId));

    // ── Audit log (if admin) ────────────────────────────────
    if (isAdmin) {
      await db.insert(adminAuditLogs).values({
        adminUserId: userId,
        bookingId,
        action: "CANCEL",
        note: reason,
        diffJson: JSON.stringify({
          previousStatus: booking.status,
          previousPaymentStatus: booking.paymentStatus,
          refundIssued,
          refundId,
        }),
      });
    }

    // ── Notify customer ─────────────────────────────────────
    const [customer] = await db
      .select()
      .from(users)
      .where(eq(users.id, job.customerId))
      .limit(1);

    if (customer?.email) {
      sendCancellationNotification({
        to: customer.email,
        name: customer.name,
        bookingId,
        reason,
        refundIssued,
      }).catch((e) => console.error("[VanJet] Cancel email error:", e));
    }
    if (customer?.phone) {
      sendCancellationSMS(customer.phone, bookingId, reason).catch((e) =>
        console.error("[VanJet] Cancel SMS error:", e)
      );
    }

    // ── Notify driver if one was assigned ───────────────────
    if (booking.driverId && booking.driverId !== userId) {
      const [driver] = await db
        .select()
        .from(users)
        .where(eq(users.id, booking.driverId))
        .limit(1);

      if (driver?.email) {
        sendCancellationNotification({
          to: driver.email,
          name: driver.name,
          bookingId,
          reason: isDriver ? "Cancelled by you." : reason,
          refundIssued: false,
        }).catch((e) =>
          console.error("[VanJet] Driver cancel email error:", e)
        );
      }
    }

    return NextResponse.json({
      cancelled: true,
      bookingId,
      refundIssued,
      refundId,
    });
  } catch (err) {
    console.error("[VanJet] Cancel booking error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
