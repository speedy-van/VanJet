// ─── VanJet · Admin Notifications Library ─────────────────────
import { db } from "@/lib/db";
import { adminNotifications } from "@/lib/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";

/**
 * Get recent admin notifications
 */
export async function getNotifications(limit = 30) {
  const rows = await db
    .select()
    .from(adminNotifications)
    .orderBy(desc(adminNotifications.createdAt))
    .limit(limit);

  return rows;
}

/**
 * Get count of unread notifications
 */
export async function getUnreadCount(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(adminNotifications)
    .where(eq(adminNotifications.read, false));

  return result[0]?.count ?? 0;
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(id: string) {
  await db
    .update(adminNotifications)
    .set({ read: true })
    .where(eq(adminNotifications.id, id));
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead() {
  await db
    .update(adminNotifications)
    .set({ read: true })
    .where(eq(adminNotifications.read, false));
}

/**
 * Create a new admin notification
 */
export async function createNotification(data: {
  type: string;
  title: string;
  body?: string | null;
  linkHref?: string | null;
  severity?: "info" | "warning" | "success" | "error";
}) {
  await db.insert(adminNotifications).values({
    type: data.type,
    title: data.title,
    body: data.body ?? null,
    linkHref: data.linkHref ?? null,
    severity: data.severity ?? "info",
  });
}
