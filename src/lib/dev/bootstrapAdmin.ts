// ─── VanJet · Dev-Only Admin Bootstrap ────────────────────────
// Creates (or updates) the admin user specified by ADMIN_EMAIL / ADMIN_PASSWORD.
// Runs once on cold-start in development only. Safe to call multiple times.

import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

let bootstrapped = false;

export async function bootstrapAdmin(): Promise<void> {
  if (bootstrapped) return;
  if (process.env.NODE_ENV !== "development") return;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log(
      "[VanJet] ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin bootstrap."
    );
    return;
  }

  try {
    const [existing] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const hash = await bcrypt.hash(password, 12);

    if (existing) {
      // Update password + ensure admin role
      await db
        .update(users)
        .set({ passwordHash: hash, role: "admin" })
        .where(eq(users.email, email));
      console.log(`[VanJet] Admin user updated: ${email}`);
    } else {
      // Create new admin user
      await db.insert(users).values({
        email,
        name: "Admin",
        role: "admin",
        passwordHash: hash,
      });
      console.log(`[VanJet] Admin user created: ${email}`);
    }
  } catch (error) {
    console.error("[VanJet] Failed to bootstrap admin:", error);
  }

  bootstrapped = true;
}
