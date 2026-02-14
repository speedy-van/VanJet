// ─── VanJet · Human-Friendly Order Number Generator ────────────
// Format: VJ-XXXX (4 random digits 0000–9999)
// Collision-safe: retries up to 20 times on unique constraint failure.

import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const MAX_RETRIES = 20;

/** Generate a candidate order number like "VJ-0042". */
function generateCandidate(): string {
  const digits = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `VJ-${digits}`;
}

/**
 * Generate a unique order number by checking the database.
 * Retries up to 20 times if a collision is found.
 */
export async function generateOrderNumber(): Promise<string> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const candidate = generateCandidate();

    // Check if already used
    const [existing] = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.orderNumber, candidate))
      .limit(1);

    if (!existing) {
      return candidate;
    }
  }

  throw new Error(
    `[VanJet] Failed to generate unique order number after ${MAX_RETRIES} attempts.`
  );
}
