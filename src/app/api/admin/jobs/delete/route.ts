// ─── VanJet · Bulk Delete Jobs API ────────────────────────────
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { jobIds } = body as { jobIds: string[] };

    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json({ error: "No job IDs provided" }, { status: 400 });
    }

    // Hard delete the jobs (cascade will handle related records)
    await db.delete(jobs).where(inArray(jobs.id, jobIds));

    return NextResponse.json({ 
      success: true, 
      deleted: jobIds.length 
    });
  } catch (error) {
    console.error("Failed to delete jobs:", error);
    return NextResponse.json({ error: "Failed to delete jobs" }, { status: 500 });
  }
}
