// ─── VanJet · Admin Drivers API ───────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { driverProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { driverProfileId, verified } = body as {
    driverProfileId: string;
    verified: boolean;
  };

  if (!driverProfileId || typeof verified !== "boolean") {
    return NextResponse.json(
      { error: "driverProfileId and verified (boolean) are required." },
      { status: 400 }
    );
  }

  await db
    .update(driverProfiles)
    .set({ verified, updatedAt: new Date() })
    .where(eq(driverProfiles.id, driverProfileId));

  return NextResponse.json({ success: true });
}
