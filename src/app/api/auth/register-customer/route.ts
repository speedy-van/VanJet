// ─── VanJet · Customer Registration API ──────────────────────
// Creates a customer account (email + password). No driver profile.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

interface RegisterCustomerBody {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RegisterCustomerBody;

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 }
      );
    }
    if (!body.email?.trim()) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }
    if (!body.password || body.password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email.toLowerCase().trim()))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Try signing in." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(body.password, 12);

    const [newUser] = await db
      .insert(users)
      .values({
        email: body.email.toLowerCase().trim(),
        name: body.name.trim(),
        phone: (body.phone ?? "").trim() || null,
        role: "customer",
        passwordHash,
      })
      .returning();

    return NextResponse.json({
      userId: newUser.id,
      message: "Account created. You can now sign in.",
    });
  } catch (err) {
    console.error("[VanJet] Customer registration error:", err);
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
