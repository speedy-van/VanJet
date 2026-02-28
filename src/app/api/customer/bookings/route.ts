// ─── VanJet · Customer My Bookings API ────────────────────────
// GET: list jobs and their bookings for the signed-in customer.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getCustomerJobsAndBookings } from "@/lib/customer/queries";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to view your bookings." },
        { status: 401 }
      );
    }

    const { jobs: jobRows, bookingsByJob } = await getCustomerJobsAndBookings(
      session.user.id
    );

    return NextResponse.json({
      jobs: jobRows,
      bookingsByJob,
    });
  } catch (err) {
    console.error("[VanJet] GET /api/customer/bookings error:", err);
    return NextResponse.json(
      { error: "Failed to load bookings" },
      { status: 500 }
    );
  }
}
