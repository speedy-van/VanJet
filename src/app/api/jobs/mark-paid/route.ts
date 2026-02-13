// ─── VanJet · Mark Job as Paid API ────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobs, bookings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface MarkPaidBody {
  jobId: string;
  paymentIntentId: string;
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

    // ── Update job status ─────────────────────────────────────
    await db
      .update(jobs)
      .set({ status: "accepted" })
      .where(eq(jobs.id, body.jobId));

    // ── Create booking record ─────────────────────────────────
    const finalPrice = job.estimatedPrice ?? "0";

    const [booking] = await db
      .insert(bookings)
      .values({
        jobId: body.jobId,
        finalPrice,
        stripePaymentIntentId: body.paymentIntentId,
        paymentStatus: "paid",
        status: "confirmed",
      })
      .returning();

    return NextResponse.json({
      bookingId: booking.id,
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
