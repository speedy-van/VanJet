// ─── VanJet · Driver Location Update API ──────────────────────
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, bookingTrackingEvents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const VALID_STATUSES = [
  "on_the_way",
  "arrived",
  "loading",
  "in_transit",
  "delivered",
] as const;

export async function POST(req: NextRequest) {
  try {
    // ── Auth: admin / assigned driver / dev key ───────────────
    let authedUserId: string | null = null;
    let isAdmin = false;

    const session = await getServerSession(authOptions);
    if (session?.user) {
      authedUserId = (session.user as { id?: string }).id ?? null;
      isAdmin = (session.user as { role?: string }).role === "admin";
    }

    // Dev-only guard (for testing without full driver auth)
    if (!authedUserId && process.env.NODE_ENV === "development") {
      const devKey = req.headers.get("x-dev-driver-key");
      if (devKey && devKey === process.env.DEV_DRIVER_KEY) {
        authedUserId = "dev-driver";
      }
    }

    if (!authedUserId) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    // ── Parse body ────────────────────────────────────────────
    const body = await req.json();
    const { bookingId, lat, lng, heading, speedKph, accuracyM, status } = body;

    if (!bookingId || lat == null || lng == null) {
      return NextResponse.json(
        { error: "bookingId, lat, and lng are required." },
        { status: 400 }
      );
    }

    // Validate lat/lng ranges
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      return NextResponse.json(
        { error: "Invalid lat/lng range." },
        { status: 400 }
      );
    }

    // Validate status
    const trackingStatus = status ?? "on_the_way";
    if (!VALID_STATUSES.includes(trackingStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    // ── Verify booking exists and is trackable ────────────────
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    if (!booking.trackingEnabled) {
      return NextResponse.json(
        { error: "Tracking is disabled for this booking." },
        { status: 403 }
      );
    }

    // Check caller is the assigned driver or admin
    if (!isAdmin && authedUserId !== "dev-driver" && booking.driverId !== authedUserId) {
      return NextResponse.json(
        { error: "Only the assigned driver or admin can update tracking." },
        { status: 403 }
      );
    }

    // ── Insert tracking event ─────────────────────────────────
    await db.insert(bookingTrackingEvents).values({
      bookingId,
      driverId: authedUserId === "dev-driver" ? null : authedUserId,
      lat: String(latNum),
      lng: String(lngNum),
      heading: heading != null ? Number(heading) : null,
      speedKph: speedKph != null ? String(speedKph) : null,
      accuracyM: accuracyM != null ? Number(accuracyM) : null,
      status: trackingStatus,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[VanJet] Tracking update error:", err);
    return NextResponse.json(
      { error: "Failed to update tracking." },
      { status: 500 }
    );
  }
}
