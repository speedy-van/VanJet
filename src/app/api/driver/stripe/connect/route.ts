// ─── VanJet · Stripe Connect Account Creation ────────────────
// POST /api/driver/stripe/connect
// Creates Express account for driver if not already exists.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { driverProfiles, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createDriverStripeAccount } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !["driver", "admin"].includes((session.user as { role?: string }).role ?? "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const [profile] = await db
      .select()
      .from(driverProfiles)
      .where(eq(driverProfiles.userId, userId))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ error: "Driver profile not found." }, { status: 404 });
    }

    if (profile.stripeAccountId) {
      return NextResponse.json({
        stripeAccountId: profile.stripeAccountId,
        message: "Stripe account already exists.",
      });
    }

    // Fetch email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const account = await createDriverStripeAccount(user.email);

    // Store account ID
    await db
      .update(driverProfiles)
      .set({
        stripeAccountId: account.id,
        updatedAt: new Date(),
      })
      .where(eq(driverProfiles.id, profile.id));

    return NextResponse.json({
      stripeAccountId: account.id,
      message: "Stripe account created. Complete onboarding to start receiving payments.",
    });
  } catch (err) {
    console.error("[VanJet] Stripe connect error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
