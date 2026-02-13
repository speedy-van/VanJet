// ─── VanJet · Admin Jobs API ──────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { jobId, status } = body as { jobId: string; status: string };

  if (!jobId || !status) {
    return NextResponse.json(
      { error: "jobId and status are required." },
      { status: 400 }
    );
  }

  const validStatuses = [
    "pending",
    "quoted",
    "accepted",
    "in_progress",
    "completed",
    "cancelled",
  ];

  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
      { status: 400 }
    );
  }

  await db
    .update(jobs)
    .set({ status, updatedAt: new Date() })
    .where(eq(jobs.id, jobId));

  return NextResponse.json({ success: true });
}
