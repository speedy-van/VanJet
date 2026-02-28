// ─── VanJet · Submit Review API ───────────────────────────────
// POST: create a review (customer who completed the booking).
// Requires session; user must be the customer for the booking.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { reviews, bookings, jobs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface SubmitBody {
  bookingId: string;
  rating: number;
  comment?: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to leave a review." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as SubmitBody;
    if (!body.bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required." },
        { status: 400 }
      );
    }
    if (
      typeof body.rating !== "number" ||
      body.rating < 1 ||
      body.rating > 5
    ) {
      return NextResponse.json(
        { error: "Rating must be a number between 1 and 5." },
        { status: 400 }
      );
    }

    const [booking] = await db
      .select({
        id: bookings.id,
        jobId: bookings.jobId,
        driverId: bookings.driverId,
        status: bookings.status,
      })
      .from(bookings)
      .where(eq(bookings.id, body.bookingId))
      .limit(1);

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    if (!booking.driverId) {
      return NextResponse.json(
        { error: "This booking has no assigned driver to review." },
        { status: 400 }
      );
    }

    const [job] = await db
      .select({ customerId: jobs.customerId })
      .from(jobs)
      .where(eq(jobs.id, booking.jobId))
      .limit(1);

    if (!job || job.customerId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only review your own completed bookings." },
        { status: 403 }
      );
    }

    const [existing] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.bookingId, body.bookingId))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "You have already reviewed this booking." },
        { status: 400 }
      );
    }

    await db.insert(reviews).values({
      bookingId: body.bookingId,
      reviewerId: session.user.id,
      revieweeId: booking.driverId,
      rating: body.rating,
      comment: (body.comment ?? "").trim() || null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[VanJet] POST /api/reviews/submit error:", err);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
