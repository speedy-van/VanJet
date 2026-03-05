// ─── VanJet · Audit Trail Helper ──────────────────────────────
// Records changes to critical tables in the change_logs table.

import { db } from "@/lib/db";
import { changeLogs } from "@/lib/db/schema";

type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "SOFT_DELETE";

/**
 * Log a change to the audit trail.
 *
 * @param tableName - The table being modified (e.g., "jobs", "bookings")
 * @param recordId - The UUID primary key of the record
 * @param action - The type of change
 * @param options - Additional context
 */
export async function logChange({
  tableName,
  recordId,
  action,
  userId,
  previousValues,
  newValues,
  reason,
}: {
  tableName: string;
  recordId: string;
  action: AuditAction;
  userId?: string | null;
  previousValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  reason?: string;
}) {
  try {
    await db.insert(changeLogs).values({
      tableName,
      recordId,
      action,
      userId: userId ?? null,
      previousValues: previousValues ? JSON.stringify(previousValues) : null,
      newValues: newValues ? JSON.stringify(newValues) : null,
      changeReason: reason ?? null,
    });
  } catch (err) {
    // Never let audit logging break the main flow
    console.error("[VanJet] Audit log error:", err);
  }
}
