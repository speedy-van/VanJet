// ─── VanJet · Admin Quotes API ────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { quotes, jobs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { quoteId, status } = body as { quoteId: string; status: string };

  if (!quoteId || !status) {
    return NextResponse.json(
      { error: "quoteId and status are required." },
      { status: 400 }
    );
  }

  const validStatuses = ["accepted", "rejected"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
      { status: 400 }
    );
  }

  // Get the quote to find the job
  const [quote] = await db
    .select({ jobId: quotes.jobId, price: quotes.price })
    .from(quotes)
    .where(eq(quotes.id, quoteId))
    .limit(1);

  if (!quote) {
    return NextResponse.json({ error: "Quote not found." }, { status: 404 });
  }

  // Update quote status
  await db
    .update(quotes)
    .set({ status, updatedAt: new Date() })
    .where(eq(quotes.id, quoteId));

  // If accepted, update the job status to "accepted" and set final price
  if (status === "accepted") {
    await db
      .update(jobs)
      .set({
        status: "accepted",
        finalPrice: quote.price,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, quote.jobId));
  }

  return NextResponse.json({ success: true });
}
