// ─── VanJet · Driver Cancel Booking API ───────────────────────
// POST /api/driver/bookings/[bookingId]/cancel
// Allows a driver to cancel their accepted booking.
// Reverts the job to "quoted" or "pending" and notifies the customer.
// Issues a refund if the customer has already paid.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { bookings, jobs, quotes, users } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { getStripe } from "@/lib/stripe";
import { sendCancellationNotification } from "@/lib/resend";
import { sendDriverCancellationSMS } from "@/lib/sms";

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

    const driverId = (session.user as { id: string }).id;
    const userRole = (session.user as { role?: string }).role ?? "customer";

    if (!["driver", "admin"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const reason = (body as { reason?: string }).reason || "Driver cancelled.";

    // ── Fetch booking ───────────────────────────────────────
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    // Verify this driver is assigned to the booking
    if (booking.driverId !== driverId && userRole !== "admin") {
      return NextResponse.json({ error: "You are not assigned to this booking." }, { status: 403 });
    }

    if (booking.status === "cancelled" || booking.status === "completed") {
      return NextResponse.json(
        { error: `Cannot cancel a ${booking.status} booking.` },
        { status: 400 }
      );
    }

    // ── Refund customer if paid ─────────────────────────────
    let refundIssued = false;
    if (
      booking.paymentStatus === "paid" &&
      booking.stripePaymentIntentId
    ) {
      try {
        const stripe = getStripe();
        await stripe.refunds.create({
          payment_intent: booking.stripePaymentIntentId,
          reason: "requested_by_customer",
        });
        refundIssued = true;
      } catch (refundErr) {
        console.error("[VanJet] Driver cancellation refund error:", refundErr);
        // Continue with cancellation even if refund fails — admin can handle manually
      }
    }

    // ── Cancel the booking ──────────────────────────────────
    await db
      .update(bookings)
      .set({
        status: "cancelled",
        paymentStatus: refundIssued ? "refunded" : booking.paymentStatus,
        cancelledAt: new Date(),
        cancelledReason: `Driver cancellation: ${reason}`,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    // ── Reject the driver's quote ───────────────────────────
    if (booking.quoteId) {
      await db
        .update(quotes)
        .set({ status: "rejected", updatedAt: new Date() })
        .where(eq(quotes.id, booking.quoteId));
    }

    // ── Revert job to allow other drivers to quote ──────────
    // Check if there are other pending quotes for this job
    const otherQuotes = await db
      .select()
      .from(quotes)
      .where(
        and(
          eq(quotes.jobId, booking.jobId),
          eq(quotes.status, "pending")
        )
      )
      .limit(1);

    const newJobStatus = otherQuotes.length > 0 ? "quoted" : "pending";

    await db
      .update(jobs)
      .set({ status: newJobStatus, finalPrice: null, updatedAt: new Date() })
      .where(eq(jobs.id, booking.jobId));

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
        sendCancellationNotification({
          to: customer.email,
          name: customer.name,
          bookingId,
          reason: `Your assigned driver has cancelled. ${refundIssued ? "A full refund has been issued." : ""} Other drivers can still send you quotes.`,
          refundIssued,
        }).catch((e) => console.error("[VanJet] Driver cancel email error:", e));
      }

      if (customer?.phone) {
        sendDriverCancellationSMS(customer.phone, bookingId).catch((e) =>
          console.error("[VanJet] Driver cancel SMS error:", e)
        );
      }
    }

    return NextResponse.json({
      cancelled: true,
      bookingId,
      refundIssued,
      newJobStatus,
    });
  } catch (err) {
    console.error("[VanJet] Driver cancel booking error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
