// ─── VanJet · Expire Old Quotes (Cron Job) ───────────────────
// GET /api/cron/expire-quotes
// Marks expired quotes as "expired" and hides them from customers.
// Intended to be called by a cron scheduler (e.g., Vercel Cron).
// Secured via CRON_SECRET header or admin session.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quotes } from "@/lib/db/schema";
import { eq, and, lt, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  // ── Security: verify cron secret or admin token ─────────
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    // In development, allow without auth but log warning
    console.warn("[VanJet] CRON_SECRET not set. expire-quotes endpoint is open.");
  }

  try {
    const now = new Date();

    // Find all pending quotes where expiresAt has passed
    const expiredQuotes = await db
      .select({ id: quotes.id, jobId: quotes.jobId })
      .from(quotes)
      .where(
        and(
          eq(quotes.status, "pending"),
          lt(quotes.expiresAt, now)
        )
      );

    if (expiredQuotes.length === 0) {
      return NextResponse.json({
        expired: 0,
        message: "No quotes to expire.",
      });
    }

    // Mark all expired quotes
    let expiredCount = 0;
    for (const q of expiredQuotes) {
      await db
        .update(quotes)
        .set({ status: "expired", updatedAt: new Date() })
        .where(eq(quotes.id, q.id));
      expiredCount++;
    }

    console.info(`[VanJet] Expired ${expiredCount} quotes.`);

    return NextResponse.json({
      expired: expiredCount,
      message: `${expiredCount} quote(s) expired.`,
    });
  } catch (err) {
    console.error("[VanJet] Expire quotes cron error:", err);
    return NextResponse.json(
      { error: "Cron job failed." },
      { status: 500 }
    );
  }
}
