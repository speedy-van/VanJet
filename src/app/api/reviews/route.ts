// ─── VanJet · Public Reviews API ───────────────────────────────
// GET: list recent reviews (no auth). Used by /reviews page and client.

import { NextRequest, NextResponse } from "next/server";
import { getPublicReviews } from "@/lib/reviews/queries";

export async function GET(req: NextRequest) {
  try {
    const limit = Math.min(
      100,
      Math.max(1, Number(req.nextUrl.searchParams.get("limit")) || 50)
    );
    const reviews = await getPublicReviews(limit);
    return NextResponse.json(reviews);
  } catch (err) {
    console.error("[VanJet] GET /api/reviews error:", err);
    return NextResponse.json(
      { error: "Failed to load reviews" },
      { status: 500 }
    );
  }
}
