// ─── VanJet · Driver Quote Submission API ─────────────────────
// POST /api/driver/quotes/create
// Auth: driver role required. Creates a quote for a pending/quoted job.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { jobs, quotes, driverProfiles, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { sendQuoteNotification } from "@/lib/resend";
import { sendNewQuoteSMS } from "@/lib/sms";

interface CreateQuoteBody {
  jobId: string;
  price: number; // GBP
  message?: string;
  estimatedDurationMinutes?: number;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !["driver", "admin"].includes((session.user as { role?: string }).role ?? "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const driverId = (session.user as { id: string }).id;
    const body = (await req.json()) as CreateQuoteBody;

    // ── Validate ────────────────────────────────────────────────
    if (!body.jobId) {
      return NextResponse.json({ error: "Job ID is required." }, { status: 400 });
    }
    if (!body.price || body.price <= 0) {
      return NextResponse.json({ error: "A valid price in GBP is required." }, { status: 400 });
    }
    if (body.price > 50000) {
      return NextResponse.json({ error: "Price exceeds maximum (£50,000)." }, { status: 400 });
    }

    // ── Check driver profile ────────────────────────────────────
    const [profile] = await db
      .select()
      .from(driverProfiles)
      .where(eq(driverProfiles.userId, driverId))
      .limit(1);

    if (!profile || profile.applicationStatus !== "approved") {
      return NextResponse.json({ error: "Your driver account must be approved first." }, { status: 403 });
    }

    // ── Check job exists and is quotable ────────────────────────
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, body.jobId))
      .limit(1);

    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    if (!["pending", "quoted"].includes(job.status)) {
      return NextResponse.json(
        { error: "This job is no longer accepting quotes." },
        { status: 400 }
      );
    }

    // ── Check for existing quote by this driver ─────────────────
    const [existing] = await db
      .select()
      .from(quotes)
      .where(and(eq(quotes.jobId, body.jobId), eq(quotes.driverId, driverId)))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "You have already submitted a quote for this job." },
        { status: 409 }
      );
    }

    // ── Create quote ────────────────────────────────────────────
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3); // expires in 3 days

    const durationStr = body.estimatedDurationMinutes
      ? `${body.estimatedDurationMinutes} min`
      : null;

    const [quote] = await db
      .insert(quotes)
      .values({
        jobId: body.jobId,
        driverId,
        price: String(body.price),
        message: body.message?.trim() || null,
        estimatedDuration: durationStr,
        status: "pending",
        expiresAt,
      })
      .returning();

    // ── Update job status to "quoted" if still pending ──────────
    if (job.status === "pending") {
      await db
        .update(jobs)
        .set({ status: "quoted", updatedAt: new Date() })
        .where(eq(jobs.id, body.jobId));
    }

    // ── Notify customer (fire-and-forget) ───────────────────────
    const [customer] = await db
      .select()
      .from(users)
      .where(eq(users.id, job.customerId))
      .limit(1);

    const [driverUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, driverId))
      .limit(1);

    if (customer?.email && driverUser) {
      sendQuoteNotification({
        to: customer.email,
        customerName: customer.name,
        driverName: driverUser.name,
        price: String(body.price),
        jobId: body.jobId,
      }).catch((e) => console.error("[VanJet] Quote email error:", e));
    }

    if (customer?.phone && driverUser) {
      sendNewQuoteSMS(customer.phone, driverUser.name, String(body.price))
        .catch((e) => console.error("[VanJet] Quote SMS error:", e));
    }

    return NextResponse.json({
      quoteId: quote.id,
      price: Number(quote.price),
      expiresAt: quote.expiresAt,
      message: "Quote submitted successfully.",
    });
  } catch (err) {
    console.error("[VanJet] Quote create error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
