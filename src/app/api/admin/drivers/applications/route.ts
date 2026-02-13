// ─── VanJet · Admin Driver Applications API ──────────────────
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { driverProfiles, users } from "@/lib/db/schema";
import { eq, desc, count, and } from "drizzle-orm";

// GET — list driver applications with optional status filter
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "pending";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const condition =
    status === "all"
      ? undefined
      : eq(driverProfiles.applicationStatus, status);

  const [rows, [totalResult], [pendingCount]] = await Promise.all([
    db
      .select({
        id: driverProfiles.id,
        userId: driverProfiles.userId,
        companyName: driverProfiles.companyName,
        vanSize: driverProfiles.vanSize,
        coverageRadius: driverProfiles.coverageRadius,
        bio: driverProfiles.bio,
        applicationStatus: driverProfiles.applicationStatus,
        rejectionReason: driverProfiles.rejectionReason,
        reviewedAt: driverProfiles.reviewedAt,
        reviewedBy: driverProfiles.reviewedBy,
        verified: driverProfiles.verified,
        createdAt: driverProfiles.createdAt,
        userName: users.name,
        userEmail: users.email,
        userPhone: users.phone,
      })
      .from(driverProfiles)
      .innerJoin(users, eq(driverProfiles.userId, users.id))
      .where(condition)
      .orderBy(desc(driverProfiles.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(driverProfiles).where(condition),
    db
      .select({ value: count() })
      .from(driverProfiles)
      .where(eq(driverProfiles.applicationStatus, "pending")),
  ]);

  return NextResponse.json({
    applications: rows,
    total: totalResult.value,
    pendingTotal: pendingCount.value,
    page,
    totalPages: Math.ceil(totalResult.value / limit),
  });
}

// PATCH — approve or reject an application
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { driverProfileId, action, rejectionReason } = body as {
    driverProfileId: string;
    action: "approve" | "reject";
    rejectionReason?: string;
  };

  if (!driverProfileId || !["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { error: "driverProfileId and action (approve|reject) are required." },
      { status: 400 }
    );
  }

  if (action === "reject" && !rejectionReason?.trim()) {
    return NextResponse.json(
      { error: "A reason is required when rejecting an application." },
      { status: 400 }
    );
  }

  // Verify the profile exists and is still pending
  const [profile] = await db
    .select({ id: driverProfiles.id, applicationStatus: driverProfiles.applicationStatus })
    .from(driverProfiles)
    .where(eq(driverProfiles.id, driverProfileId))
    .limit(1);

  if (!profile) {
    return NextResponse.json({ error: "Driver profile not found." }, { status: 404 });
  }

  const now = new Date();

  if (action === "approve") {
    await db
      .update(driverProfiles)
      .set({
        applicationStatus: "approved",
        verified: true,
        rejectionReason: null,
        reviewedAt: now,
        reviewedBy: session.user.email ?? "admin",
        updatedAt: now,
      })
      .where(eq(driverProfiles.id, driverProfileId));
  } else {
    await db
      .update(driverProfiles)
      .set({
        applicationStatus: "rejected",
        verified: false,
        rejectionReason: rejectionReason!.trim(),
        reviewedAt: now,
        reviewedBy: session.user.email ?? "admin",
        updatedAt: now,
      })
      .where(eq(driverProfiles.id, driverProfileId));
  }

  return NextResponse.json({ success: true, action });
}
