// ─── VanJet · Visitor Tracking API ────────────────────────────
// POST: Track a visitor/page view

import { NextRequest, NextResponse } from "next/server";
import { trackVisitor, trackPageView } from "@/lib/visitors/tracking";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  try {
    const body = await req.json();
    const userAgent = req.headers.get("user-agent") || "";

    // Track visitor
    const { visitor, isNew } = await trackVisitor({
      ip,
      userAgent,
    });

    // Track page view if page is provided
    if (body.page) {
      await trackPageView(visitor.id, body.page, {
        referrer: body.referrer || req.headers.get("referer") || undefined,
        durationMs: body.durationMs,
      });
    }

    return NextResponse.json({
      success: true,
      visitorId: visitor.id,
      isNew,
    });
  } catch (error) {
    console.error("[Visitors API] Error:", error);
    return NextResponse.json(
      { error: "Failed to track visitor" },
      { status: 500 }
    );
  }
}
