// ─── VanJet · AI Agent Audit ──────────────────────────────────
// Logs all AI tool actions for audit trail

import { db } from "@/lib/db";
import { aiAgentAuditLogs } from "@/lib/db/schema";

interface LogToolActionParams {
  adminId: string;
  toolName: string;
  input: unknown;
  output?: unknown;
  status: "pending" | "success" | "error";
}

/**
 * Log an AI agent tool action to the audit table
 */
export async function logAIToolAction(params: LogToolActionParams): Promise<void> {
  const { adminId, toolName, input, output, status } = params;

  try {
    await db.insert(aiAgentAuditLogs).values({
      actorAdminId: adminId,
      toolName,
      input: JSON.stringify(input),
      output: output ? JSON.stringify(output) : null,
      status,
      completedAt: status !== "pending" ? new Date() : null,
    });
  } catch (error) {
    // Don't throw - audit logging should not break the main flow
    console.error("[AI Audit] Failed to log action:", error);
  }
}

/**
 * Update an existing audit log entry with completion data
 */
export async function completeAuditLog(
  adminId: string,
  toolName: string,
  output: unknown,
  status: "success" | "error"
): Promise<void> {
  // For simplicity, we're logging a new entry instead of updating
  // This provides a clearer audit trail of pending -> completed
  await logAIToolAction({
    adminId,
    toolName,
    input: { note: "completion update" },
    output,
    status,
  });
}
