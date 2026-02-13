// ─── VanJet · Admin Booking Update API ────────────────────────
// PATCH /api/admin/bookings/[id]/update
// Updates the booking's linked job fields (addresses, schedule, service type, items).
// Requires admin session. Writes audit log entry.
// Run `npx drizzle-kit push` after schema changes to sync DB.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { bookings, jobs, jobItems, adminAuditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// ── Input types ────────────────────────────────────────────────

interface UpdateItemInput {
  name: string;
  category?: string;
  quantity: number;
  weightKg?: number;
  volumeM3?: number;
  requiresDismantling?: boolean;
  fragile?: boolean;
  notes?: string;
}

interface UpdateBookingBody {
  pickupAddress?: string;
  deliveryAddress?: string;
  moveDate?: string;
  jobType?: string;
  preferredTimeWindow?: string;
  pickupFloor?: number;
  pickupFlat?: string;
  pickupHasLift?: boolean;
  pickupNotes?: string;
  deliveryFloor?: number;
  deliveryFlat?: string;
  deliveryHasLift?: boolean;
  deliveryNotes?: string;
  description?: string;
  contactName?: string;
  contactPhone?: string;
  items?: UpdateItemInput[];
}

// ── Route handler ──────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // RBAC check
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: bookingId } = await params;

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
      { error: "Cannot edit a cancelled booking." },
      { status: 400 }
    );
  }

  // Fetch linked job
  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, booking.jobId))
    .limit(1);

  if (!job) {
    return NextResponse.json({ error: "Linked job not found." }, { status: 404 });
  }

  const body = (await req.json()) as UpdateBookingBody;

  // Validate at least one field is being updated
  const hasJobUpdate = [
    "pickupAddress",
    "deliveryAddress",
    "moveDate",
    "jobType",
    "preferredTimeWindow",
    "pickupFloor",
    "pickupFlat",
    "pickupHasLift",
    "pickupNotes",
    "deliveryFloor",
    "deliveryFlat",
    "deliveryHasLift",
    "deliveryNotes",
    "description",
    "contactName",
    "contactPhone",
  ].some((k) => body[k as keyof UpdateBookingBody] !== undefined);

  const hasItemsUpdate = Array.isArray(body.items);

  if (!hasJobUpdate && !hasItemsUpdate) {
    return NextResponse.json(
      { error: "No fields to update." },
      { status: 400 }
    );
  }

  // Build diff for audit log
  const diff: Record<string, { old: unknown; new: unknown }> = {};

  // Build job update set
  const jobUpdate: Record<string, unknown> = { updatedAt: new Date() };

  const jobFieldMap: Array<{
    key: keyof UpdateBookingBody;
    column: string;
    transform?: (v: unknown) => unknown;
  }> = [
    { key: "pickupAddress", column: "pickupAddress" },
    { key: "deliveryAddress", column: "deliveryAddress" },
    {
      key: "moveDate",
      column: "moveDate",
      transform: (v) => new Date(v as string),
    },
    { key: "jobType", column: "jobType" },
    { key: "preferredTimeWindow", column: "preferredTimeWindow" },
    { key: "pickupFloor", column: "pickupFloor" },
    { key: "pickupFlat", column: "pickupFlat" },
    { key: "pickupHasLift", column: "pickupHasLift" },
    { key: "pickupNotes", column: "pickupNotes" },
    { key: "deliveryFloor", column: "deliveryFloor" },
    { key: "deliveryFlat", column: "deliveryFlat" },
    { key: "deliveryHasLift", column: "deliveryHasLift" },
    { key: "deliveryNotes", column: "deliveryNotes" },
    { key: "description", column: "description" },
    { key: "contactName", column: "contactName" },
    { key: "contactPhone", column: "contactPhone" },
  ];

  for (const { key, column, transform } of jobFieldMap) {
    const newVal = body[key];
    if (newVal !== undefined) {
      const oldVal = job[column as keyof typeof job];
      const transformed = transform ? transform(newVal) : newVal;
      jobUpdate[column] = transformed;
      diff[column] = {
        old: oldVal instanceof Date ? oldVal.toISOString() : oldVal,
        new: newVal,
      };
    }
  }

  // Apply job updates
  if (Object.keys(jobUpdate).length > 1) {
    // more than just updatedAt
    await db
      .update(jobs)
      .set(jobUpdate)
      .where(eq(jobs.id, booking.jobId));
  }

  // Handle items update (replace strategy: delete all, insert new)
  if (hasItemsUpdate && body.items) {
    // Fetch old items for diff
    const oldItems = await db
      .select()
      .from(jobItems)
      .where(eq(jobItems.jobId, booking.jobId));

    diff["items"] = {
      old: oldItems.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        category: i.category,
      })),
      new: body.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        category: i.category,
      })),
    };

    // Delete existing items
    await db.delete(jobItems).where(eq(jobItems.jobId, booking.jobId));

    // Insert new items
    if (body.items.length > 0) {
      const insertRows = body.items.map((item) => ({
        jobId: booking.jobId,
        name: item.name,
        category: item.category ?? null,
        quantity: item.quantity,
        weightKg: item.weightKg != null ? String(item.weightKg) : null,
        volumeM3: item.volumeM3 != null ? String(item.volumeM3) : null,
        requiresDismantling: item.requiresDismantling ?? false,
        fragile: item.fragile ?? false,
        notes: item.notes ?? null,
      }));
      await db.insert(jobItems).values(insertRows);
    }
  }

  // Write audit log
  await db.insert(adminAuditLogs).values({
    adminUserId: session.user.id,
    bookingId,
    action: "EDIT",
    diffJson: JSON.stringify(diff),
  });

  // Re-fetch updated data
  const [updatedJob] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, booking.jobId))
    .limit(1);

  const updatedItems = await db
    .select()
    .from(jobItems)
    .where(eq(jobItems.jobId, booking.jobId));

  return NextResponse.json({
    success: true,
    job: updatedJob,
    items: updatedItems,
  });
}
