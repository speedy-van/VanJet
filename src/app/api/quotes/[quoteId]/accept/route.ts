// ─── VanJet · Accept Quote API ────────────────────────────────
// POST /api/quotes/[quoteId]/accept
// Customer accepts a quote → creates booking → awaiting payment.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobs, quotes, bookings } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { generateTrackingToken } from "@/lib/tracking/token";
import { generateOrderNumber } from "@/lib/order-number";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const { quoteId } = await params;
    const body = await req.json().catch(() => ({}));

    if (!quoteId) {
      return NextResponse.json({ error: "Quote ID is required." }, { status: 400 });
    }

    // ── Fetch quote ─────────────────────────────────────────
    const [quote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, quoteId))
      .limit(1);

    if (!quote) {
      return NextResponse.json({ error: "Quote not found." }, { status: 404 });
    }

    // ── Security: Validate job ownership via jobId token ────
    if (body.jobId && body.jobId !== quote.jobId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    if (quote.status !== "pending") {
      return NextResponse.json(
        { error: "This quote is no longer available." },
        { status: 400 }
      );
    }

    // ── Fetch job ─────────────────────────────────────────────
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, quote.jobId))
      .limit(1);

    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    if (!["pending", "quoted"].includes(job.status)) {
      return NextResponse.json(
        { error: "This job is no longer accepting quotes." },
        { status: 400 }
      );
    }

    // ── Accept this quote, reject others ────────────────────────
    await db
      .update(quotes)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(quotes.id, quoteId));

    // Reject all other pending quotes for this job
    await db
      .update(quotes)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(
        and(
          eq(quotes.jobId, quote.jobId),
          ne(quotes.id, quoteId)
        )
      );

    // ── Update job ──────────────────────────────────────────────
    await db
      .update(jobs)
      .set({
        status: "accepted",
        finalPrice: quote.price,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, quote.jobId));

    // ── Create booking (awaiting payment) ───────────────────────
    const trackingToken = generateTrackingToken();
    const orderNumber = await generateOrderNumber();

    const [booking] = await db
      .insert(bookings)
      .values({
        jobId: quote.jobId,
        quoteId: quote.id,
        driverId: quote.driverId,
        finalPrice: quote.price,
        paymentStatus: "unpaid",
        status: "confirmed",
        trackingToken,
        trackingEnabled: true,
        orderNumber,
      })
      .returning();

    return NextResponse.json({
      bookingId: booking.id,
      orderNumber: booking.orderNumber,
      jobId: quote.jobId,
      quoteId: quote.id,
      driverId: quote.driverId,
      price: Number(quote.price),
      trackingToken,
      status: "awaiting_payment",
    });
  } catch (err) {
    console.error("[VanJet] Accept quote error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
