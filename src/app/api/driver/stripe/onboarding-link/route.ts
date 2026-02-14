// ─── VanJet · Stripe Onboarding Link API ──────────────────────
// GET /api/driver/stripe/onboarding-link
// Returns onboarding URL for the driver's Stripe Express account.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { driverProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createOnboardingLink } from "@/lib/stripe";

export async function GET(req: NextRequest) {
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

    if (!profile.stripeAccountId) {
      return NextResponse.json(
        { error: "No Stripe account found. Please create one first." },
        { status: 400 }
      );
    }

    const url = await createOnboardingLink(profile.stripeAccountId);

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[VanJet] Stripe onboarding link error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
