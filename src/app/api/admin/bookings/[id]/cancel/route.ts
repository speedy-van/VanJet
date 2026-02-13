// ─── VanJet · Admin Booking Cancel API ────────────────────────
// POST /api/admin/bookings/[id]/cancel
// Cancels a booking with a required reason. Does NOT delete the booking.
// Requires admin session. Writes audit log entry.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { bookings, jobs, adminAuditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface CancelBody {
  reason: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // RBAC check
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: bookingId } = await params;

  // Parse body
  const body = (await req.json()) as CancelBody;

  if (!body.reason || body.reason.trim().length < 3) {
    return NextResponse.json(
      { error: "A cancellation reason is required (minimum 3 characters)." },
      { status: 400 }
    );
  }

  // Fetch booking
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  if (booking.status === "cancelled") {
    return NextResponse.json(
      { error: "Booking is already cancelled." },
      { status: 400 }
    );
  }

  const now = new Date();

  // Update booking status
  await db
    .update(bookings)
    .set({
      status: "cancelled",
      cancelledAt: now,
      cancelledReason: body.reason.trim(),
      updatedAt: now,
    })
    .where(eq(bookings.id, bookingId));

  // Also update the linked job to cancelled
  await db
    .update(jobs)
    .set({ status: "cancelled", updatedAt: now })
    .where(eq(jobs.id, booking.jobId));

  // Write audit log
  await db.insert(adminAuditLogs).values({
    adminUserId: session.user.id,
    bookingId,
    action: "CANCEL",
    diffJson: JSON.stringify({
      status: { old: booking.status, new: "cancelled" },
    }),
    note: body.reason.trim(),
  });

  return NextResponse.json({
    success: true,
    status: "cancelled",
    cancelledAt: now.toISOString(),
  });
}
