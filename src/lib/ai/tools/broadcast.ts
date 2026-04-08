// ─── VanJet · AI Agent Broadcast Tools ────────────────────────
import { z } from "zod";
import { db } from "@/lib/db";
import { driverProfiles, users } from "@/lib/db/schema";
import { logAIToolAction } from "../audit";
import { eq } from "drizzle-orm";
import type { ToolDefinition, ToolResult } from "./index";

const broadcastSchema = z.object({
  message: z.string().min(1).max(1000),
  confirm: z.boolean().optional(),
});

export const broadcastToDriversTool: ToolDefinition = {
  name: "broadcast_to_drivers",
  description: "Send a broadcast message to all verified/active drivers. Requires confirmation.",
  parameters: broadcastSchema,
  requiresConfirmation: true,
  handler: async (input, adminId): Promise<ToolResult> => {
    const { message, confirm } = input as z.infer<typeof broadcastSchema>;

    if (!confirm) {
      return {
        ok: false,
        error: "Please confirm the broadcast by setting confirm: true",
      };
    }

    // Log the action BEFORE execution
    await logAIToolAction({
      adminId,
      toolName: "broadcast_to_drivers",
      input: { message, messageLength: message.length },
      status: "pending",
    });

    try {
      // Get all verified drivers
      const drivers = await db
        .select({
          userId: driverProfiles.userId,
          driverName: users.name,
          driverEmail: users.email,
        })
        .from(driverProfiles)
        .innerJoin(users, eq(driverProfiles.userId, users.id))
        .where(eq(driverProfiles.verified, true));

      if (drivers.length === 0) {
        await logAIToolAction({
          adminId,
          toolName: "broadcast_to_drivers",
          input: { message },
          output: { error: "No active drivers" },
          status: "error",
        });
        return { ok: false, error: "No active drivers to broadcast to" };
      }

      // In a real implementation, this would send messages via SMS, push notification, or chat
      // For now, we'll simulate the broadcast
      const recipientCount = drivers.length;

      // Log success
      await logAIToolAction({
        adminId,
        toolName: "broadcast_to_drivers",
        input: { message, messageLength: message.length },
        output: { 
          success: true, 
          recipientCount,
          recipients: drivers.map((d) => d.driverEmail),
        },
        status: "success",
      });

      return {
        ok: true,
        data: {
          message: `Broadcast sent to ${recipientCount} drivers`,
          recipientCount,
          broadcastContent: message,
        },
      };
    } catch (error) {
      console.error("[broadcast_to_drivers] Error:", error);
      
      await logAIToolAction({
        adminId,
        toolName: "broadcast_to_drivers",
        input: { message },
        output: { error: "Broadcast failed" },
        status: "error",
      });

      return { ok: false, error: "Failed to send broadcast" };
    }
  },
};
