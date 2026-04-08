// ─── VanJet · Admin Notification Service ──────────────────────
import { db } from "@/lib/db";
import { adminNotifications } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

export type NotificationType =
  | "new_order"
  | "driver_applied"
  | "booking_cancelled"
  | "payment_received"
  | "driver_verified";

export type NotificationSeverity = "info" | "warning" | "success" | "error";

interface CreateNotificationParams {
  type: NotificationType;
  severity?: NotificationSeverity;
  title: string;
  body?: string;
  linkHref?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  const { type, severity = "info", title, body, linkHref } = params;

  try {
    const [notification] = await db
      .insert(adminNotifications)
      .values({ type, severity, title, body, linkHref })
      .returning();

    return notification;
  } catch (error) {
    console.error("[Notifications] Create error:", error);
    return null;
  }
}

export async function getNotifications(limit = 20) {
  return db
    .select()
    .from(adminNotifications)
    .orderBy(desc(adminNotifications.createdAt))
    .limit(limit);
}

export async function getUnreadCount() {
  const results = await db
    .select()
    .from(adminNotifications)
    .where(eq(adminNotifications.read, false));

  return results.length;
}

export async function markAsRead(id: string) {
  await db
    .update(adminNotifications)
    .set({ read: true })
    .where(eq(adminNotifications.id, id));
}

export async function markAllAsRead() {
  await db
    .update(adminNotifications)
    .set({ read: true })
    .where(eq(adminNotifications.read, false));
}
