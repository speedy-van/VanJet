// ─── VanJet · New Orders Polling Endpoint ─────────────────────
// Returns orders created since `since` timestamp for serverless-friendly polling

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { gt, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Verify admin session
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = req.nextUrl.searchParams.get("since");
  const sinceDate = since ? new Date(since) : new Date(Date.now() - 30000); // Default: last 30 seconds

  try {
    // Fetch orders created after the `since` timestamp
    const newOrders = await db
      .select({
        id: jobs.id,
        referenceNumber: jobs.referenceNumber,
        jobType: jobs.jobType,
        pickupAddress: jobs.pickupAddress,
        deliveryAddress: jobs.deliveryAddress,
        estimatedPrice: jobs.estimatedPrice,
        createdAt: jobs.createdAt,
      })
      .from(jobs)
      .where(gt(jobs.createdAt, sinceDate))
      .orderBy(desc(jobs.createdAt))
      .limit(10);

    return NextResponse.json({
      orders: newOrders.map((order) => ({
        orderId: order.id,
        orderNumber: order.referenceNumber,
        serviceType: order.jobType,
        pickup: order.pickupAddress,
        delivery: order.deliveryAddress,
        price: order.estimatedPrice,
        createdAt: order.createdAt?.toISOString(),
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[orders/poll] Error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
