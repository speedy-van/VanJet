// ─── VanJet · AI Agent Drivers Tools ──────────────────────────
import { z } from "zod";
import { db } from "@/lib/db";
import { driverProfiles, users } from "@/lib/db/schema";
import { logAIToolAction } from "../audit";
import { eq, desc, and } from "drizzle-orm";
import type { ToolDefinition, ToolResult } from "./index";

const getDriversSchema = z.object({
  verified: z.boolean().optional(),
  limit: z.number().min(1).max(50).optional().default(10),
});

const suspendDriverSchema = z.object({
  driverId: z.string().uuid(),
  reason: z.string().min(1).max(500),
  confirm: z.boolean().optional(),
});

export const getDriversTool: ToolDefinition = {
  name: "get_drivers",
  description: "Get a list of drivers with optional filters. Returns driver name, company, van size, rating, jobs count, and verification status.",
  parameters: getDriversSchema,
  requiresConfirmation: false,
  handler: async (input): Promise<ToolResult> => {
    const { verified, limit } = input as z.infer<typeof getDriversSchema>;

    try {
      const conditions = verified !== undefined ? eq(driverProfiles.verified, verified) : undefined;

      const results = await db
        .select({
          id: driverProfiles.id,
          userId: driverProfiles.userId,
          companyName: driverProfiles.companyName,
          vanSize: driverProfiles.vanSize,
          rating: driverProfiles.rating,
          totalJobs: driverProfiles.totalJobs,
          verified: driverProfiles.verified,
          stripeOnboarded: driverProfiles.stripeOnboarded,
          driverName: users.name,
          driverEmail: users.email,
          driverPhone: users.phone,
        })
        .from(driverProfiles)
        .innerJoin(users, eq(driverProfiles.userId, users.id))
        .where(conditions)
        .orderBy(desc(driverProfiles.createdAt))
        .limit(limit);

      return {
        ok: true,
        data: {
          count: results.length,
          drivers: results.map((d) => ({
            id: d.id,
            userId: d.userId,
            name: d.driverName,
            email: d.driverEmail,
            phone: d.driverPhone,
            company: d.companyName,
            van: d.vanSize,
            rating: d.rating ? Number(d.rating).toFixed(1) : null,
            jobs: d.totalJobs,
            verified: d.verified,
            stripeReady: d.stripeOnboarded,
          })),
        },
      };
    } catch (error) {
      console.error("[get_drivers] Error:", error);
      return { ok: false, error: "Failed to fetch drivers" };
    }
  },
};

export const suspendDriverTool: ToolDefinition = {
  name: "suspend_driver",
  description: "Suspend a driver by setting their verification status to false. Requires confirmation.",
  parameters: suspendDriverSchema,
  requiresConfirmation: true,
  handler: async (input, adminId): Promise<ToolResult> => {
    const { driverId, reason, confirm } = input as z.infer<typeof suspendDriverSchema>;

    if (!confirm) {
      return {
        ok: false,
        error: "Please confirm the suspension by setting confirm: true",
      };
    }

    // Log the action BEFORE execution
    await logAIToolAction({
      adminId,
      toolName: "suspend_driver",
      input: { driverId, reason },
      status: "pending",
    });

    try {
      // Find and update the driver
      const [driver] = await db
        .select({ id: driverProfiles.id, userId: driverProfiles.userId })
        .from(driverProfiles)
        .where(eq(driverProfiles.id, driverId))
        .limit(1);

      if (!driver) {
        await logAIToolAction({
          adminId,
          toolName: "suspend_driver",
          input: { driverId, reason },
          output: { error: "Driver not found" },
          status: "error",
        });
        return { ok: false, error: "Driver not found" };
      }

      await db
        .update(driverProfiles)
        .set({
          verified: false,
          updatedAt: new Date(),
        })
        .where(eq(driverProfiles.id, driverId));

      // Log success
      await logAIToolAction({
        adminId,
        toolName: "suspend_driver",
        input: { driverId, reason },
        output: { success: true, driverId },
        status: "success",
      });

      return {
        ok: true,
        data: {
          message: "Driver has been suspended",
          driverId,
          reason,
        },
      };
    } catch (error) {
      console.error("[suspend_driver] Error:", error);
      
      await logAIToolAction({
        adminId,
        toolName: "suspend_driver",
        input: { driverId, reason },
        output: { error: "Database error" },
        status: "error",
      });

      return { ok: false, error: "Failed to suspend driver" };
    }
  },
};
