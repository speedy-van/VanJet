// ─── VanJet · Admin Assign Driver API ─────────────────────────
// POST /api/admin/bookings/[id]/assign-driver
// Manually assigns a driver to a booking (fallback when no quotes).

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { bookings, jobs, driverProfiles, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendBookingConfirmation } from "@/lib/resend";
import { sendBookingConfirmedSMS } from "@/lib/sms";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;
    const body = await req.json();
    const { driverUserId } = body as { driverUserId: string };

    if (!driverUserId) {
      return NextResponse.json({ error: "Driver user ID is required." }, { status: 400 });
    }

    // Verify booking exists
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    // Verify driver exists and is approved
    const [profile] = await db
      .select()
      .from(driverProfiles)
      .where(eq(driverProfiles.userId, driverUserId))
      .limit(1);

    if (!profile || profile.applicationStatus !== "approved") {
      return NextResponse.json({ error: "Driver not found or not approved." }, { status: 400 });
    }

    // Assign driver
    await db
      .update(bookings)
      .set({ driverId: driverUserId, updatedAt: new Date() })
      .where(eq(bookings.id, bookingId));

    // Notify driver
    const [driver] = await db.select().from(users).where(eq(users.id, driverUserId)).limit(1);
    const [job] = await db.select().from(jobs).where(eq(jobs.id, booking.jobId)).limit(1);

    if (driver?.email && job) {
      sendBookingConfirmation({
        to: driver.email,
        name: driver.name,
        bookingId,
        moveDate: job.moveDate.toLocaleDateString("en-GB"),
        price: booking.finalPrice,
      }).catch((e) => console.error("[VanJet] Assign email error:", e));
    }

    if (driver?.phone) {
      sendBookingConfirmedSMS(
        driver.phone,
        bookingId,
        job?.moveDate.toLocaleDateString("en-GB") ?? ""
      ).catch((e) => console.error("[VanJet] Assign SMS error:", e));
    }

    return NextResponse.json({
      success: true,
      bookingId,
      driverId: driverUserId,
    });
  } catch (err) {
    console.error("[VanJet] Assign driver error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
