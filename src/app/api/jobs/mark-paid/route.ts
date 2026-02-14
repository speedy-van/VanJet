// ─── VanJet · Mark Job as Paid API ────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobs, bookings, quotes, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateTrackingToken } from "@/lib/tracking/token";
import { generateOrderNumber } from "@/lib/order-number";
import { sendBookingConfirmation } from "@/lib/resend";
import { sendBookingConfirmedSMS } from "@/lib/sms";

interface MarkPaidBody {
  jobId: string;
  paymentIntentId: string;
  bookingId?: string; // if booking already exists (quote-based flow)
  quoteId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as MarkPaidBody;

    if (!body.jobId) {
      return NextResponse.json(
        { error: "Job ID is required." },
        { status: 400 }
      );
    }
    if (!body.paymentIntentId) {
      return NextResponse.json(
        { error: "Payment intent ID is required." },
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

    // ── Quote-based flow: booking already exists ────────────────
    if (body.bookingId) {
      const [existing] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, body.bookingId))
        .limit(1);

      if (existing) {
        await db
          .update(bookings)
          .set({
            stripePaymentIntentId: body.paymentIntentId,
            paymentStatus: "paid",
            updatedAt: new Date(),
          })
          .where(eq(bookings.id, body.bookingId));

        await db
          .update(jobs)
          .set({ status: "accepted", updatedAt: new Date() })
          .where(eq(jobs.id, body.jobId));

        // Notify both parties
        const [customer] = await db.select().from(users).where(eq(users.id, job.customerId)).limit(1);
        if (existing.driverId) {
          const [driver] = await db.select().from(users).where(eq(users.id, existing.driverId)).limit(1);
          if (driver?.email) {
            sendBookingConfirmation({
              to: driver.email,
              name: driver.name,
              bookingId: existing.id,
              moveDate: job.moveDate.toLocaleDateString("en-GB"),
              price: existing.finalPrice,
            }).catch((e) => console.error("[VanJet] Booking email error:", e));
          }
          if (driver?.phone) {
            sendBookingConfirmedSMS(driver.phone, existing.id, job.moveDate.toLocaleDateString("en-GB"))
              .catch((e) => console.error("[VanJet] Booking SMS error:", e));
          }
        }
        if (customer?.email) {
          sendBookingConfirmation({
            to: customer.email,
            name: customer.name,
            bookingId: existing.id,
            moveDate: job.moveDate.toLocaleDateString("en-GB"),
            price: existing.finalPrice,
          }).catch((e) => console.error("[VanJet] Booking email error:", e));
        }

        return NextResponse.json({
          bookingId: existing.id,
          trackingToken: existing.trackingToken,
          status: "paid",
        });
      }
    }

    // ── Direct booking flow (no prior booking) ──────────────────
    await db
      .update(jobs)
      .set({ status: "accepted" })
      .where(eq(jobs.id, body.jobId));

    const finalPrice = job.estimatedPrice ?? "0";
    const trackingToken = generateTrackingToken();
    const orderNumber = await generateOrderNumber();

    const [booking] = await db
      .insert(bookings)
      .values({
        jobId: body.jobId,
        finalPrice,
        stripePaymentIntentId: body.paymentIntentId,
        paymentStatus: "paid",
        status: "confirmed",
        trackingToken,
        trackingEnabled: true,
        orderNumber,
      })
      .returning();

    // Notify customer
    const [customer] = await db.select().from(users).where(eq(users.id, job.customerId)).limit(1);
    if (customer?.email) {
      sendBookingConfirmation({
        to: customer.email,
        name: customer.name,
        bookingId: booking.id,
        moveDate: job.moveDate.toLocaleDateString("en-GB"),
        price: finalPrice,
      }).catch((e) => console.error("[VanJet] Booking email error:", e));
    }

    return NextResponse.json({
      bookingId: booking.id,
      trackingToken: booking.trackingToken,
      status: "paid",
    });
  } catch (err) {
    console.error("[VanJet] Mark paid error:", err);
    const message =
      err instanceof Error
        ? err.message
        : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
