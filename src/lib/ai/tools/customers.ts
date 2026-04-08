// ─── VanJet · AI Agent Customers Tools ────────────────────────
import { z } from "zod";
import { db } from "@/lib/db";
import { users, jobs } from "@/lib/db/schema";
import { eq, desc, count, and, ilike, or } from "drizzle-orm";
import type { ToolDefinition, ToolResult } from "./index";

const getCustomersSchema = z.object({
  search: z.string().optional(),
  limit: z.number().min(1).max(50).optional().default(10),
});

export const getCustomersTool: ToolDefinition = {
  name: "get_customers",
  description: "Get a list of customers with their order counts. Optionally search by name or email.",
  parameters: getCustomersSchema,
  requiresConfirmation: false,
  handler: async (input): Promise<ToolResult> => {
    const { search, limit } = input as z.infer<typeof getCustomersSchema>;

    try {
      let conditions = eq(users.role, "customer");
      
      if (search) {
        conditions = and(
          eq(users.role, "customer"),
          or(
            ilike(users.name, `%${search}%`),
            ilike(users.email, `%${search}%`)
          )
        )!;
      }

      const results = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          emailVerified: users.emailVerified,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(conditions)
        .orderBy(desc(users.createdAt))
        .limit(limit);

      // Get job counts for each customer
      const customerIds = results.map((r) => r.id);
      const jobCounts = await Promise.all(
        customerIds.map(async (customerId) => {
          const [result] = await db
            .select({ count: count() })
            .from(jobs)
            .where(eq(jobs.customerId, customerId));
          return { customerId, count: result?.count ?? 0 };
        })
      );

      const jobCountMap = new Map(jobCounts.map((j) => [j.customerId, j.count]));

      return {
        ok: true,
        data: {
          count: results.length,
          customers: results.map((c) => ({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            verified: c.emailVerified,
            orders: jobCountMap.get(c.id) ?? 0,
            since: c.createdAt?.toISOString(),
          })),
        },
      };
    } catch (error) {
      console.error("[get_customers] Error:", error);
      return { ok: false, error: "Failed to fetch customers" };
    }
  },
};
