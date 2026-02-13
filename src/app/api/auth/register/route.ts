// ─── VanJet · Driver Registration API ─────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, driverProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

interface RegisterBody {
  name: string;
  email: string;
  password: string;
  phone: string;
  companyName?: string;
  vanSize: string;
  coverageRadius?: number;
  bio?: string;
}

const VAN_SIZES = ["Small Van", "SWB", "MWB", "LWB", "XLWB", "Luton", "Luton Tail Lift"];

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RegisterBody;

    // ── Validate required fields ──────────────────────────────
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    }
    if (!body.email?.trim()) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    if (!body.password || body.password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (!body.phone?.trim()) {
      return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    }
    if (!body.vanSize || !VAN_SIZES.includes(body.vanSize)) {
      return NextResponse.json({ error: "Valid van size is required." }, { status: 400 });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    // ── Check existing user ───────────────────────────────────
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email.toLowerCase().trim()))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // ── Hash password ─────────────────────────────────────────
    const passwordHash = await bcrypt.hash(body.password, 12);

    // ── Create user with role=driver ──────────────────────────
    const [newUser] = await db
      .insert(users)
      .values({
        email: body.email.toLowerCase().trim(),
        name: body.name.trim(),
        phone: body.phone.trim(),
        role: "driver",
        passwordHash,
      })
      .returning();

    // ── Create driver profile ─────────────────────────────────
    const [profile] = await db
      .insert(driverProfiles)
      .values({
        userId: newUser.id,
        companyName: body.companyName?.trim() || null,
        vanSize: body.vanSize,
        coverageRadius: body.coverageRadius ?? 50,
        bio: body.bio?.trim() || null,
        verified: false,
      })
      .returning();

    return NextResponse.json({
      userId: newUser.id,
      profileId: profile.id,
      message: "Registration successful. Your account is pending verification.",
    });
  } catch (err) {
    console.error("[VanJet] Driver registration error:", err);
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
