// ─── VanJet · Admin Visitors Stats API ────────────────────────
// GET: Fetch visitor analytics (admin only)

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import {
  getVisitorStats,
  getPageViewStats,
  getRecentVisitors,
} from "@/lib/visitors/tracking";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const [stats, pageViews, recent] = await Promise.all([
      getVisitorStats(days),
      getPageViewStats(days),
      getRecentVisitors({ page, limit }),
    ]);

    return NextResponse.json({
      stats,
      pageViews,
      recent,
    });
  } catch (error) {
    console.error("[Admin Visitors API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch visitor data" },
      { status: 500 }
    );
  }
}
