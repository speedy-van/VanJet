// ─── VanJet · AI Agent Orders Tools ───────────────────────────
import { z } from "zod";
import { db } from "@/lib/db";
import { jobs, bookings, users } from "@/lib/db/schema";
import { eq, desc, and, ilike, or } from "drizzle-orm";
import type { ToolDefinition, ToolResult } from "./index";

const getOrdersSchema = z.object({
  status: z.enum(["pending", "quoted", "accepted", "in_progress", "completed", "cancelled"]).optional(),
  limit: z.number().min(1).max(50).optional().default(10),
});

const getOrderByIdSchema = z.object({
  id: z.string().uuid(),
});

export const getOrdersTool: ToolDefinition = {
  name: "get_orders",
  description: "Get a list of orders/jobs with optional status filter. Returns pickup, delivery, status, price, and customer info.",
  parameters: getOrdersSchema,
  requiresConfirmation: false,
  handler: async (input): Promise<ToolResult> => {
    const { status, limit } = input as z.infer<typeof getOrdersSchema>;

    try {
      const conditions = status ? eq(jobs.status, status) : undefined;

      const results = await db
        .select({
          id: jobs.id,
          referenceNumber: jobs.referenceNumber,
          status: jobs.status,
          pickupAddress: jobs.pickupAddress,
          deliveryAddress: jobs.deliveryAddress,
          moveDate: jobs.moveDate,
          estimatedPrice: jobs.estimatedPrice,
          customerName: users.name,
          customerEmail: users.email,
          createdAt: jobs.createdAt,
        })
        .from(jobs)
        .leftJoin(users, eq(jobs.customerId, users.id))
        .where(conditions)
        .orderBy(desc(jobs.createdAt))
        .limit(limit);

      return {
        ok: true,
        data: {
          count: results.length,
          orders: results.map((r) => ({
            id: r.id,
            ref: r.referenceNumber,
            status: r.status,
            from: r.pickupAddress,
            to: r.deliveryAddress,
            date: r.moveDate?.toISOString(),
            price: r.estimatedPrice ? `£${Number(r.estimatedPrice).toFixed(2)}` : null,
            customer: r.customerName,
            email: r.customerEmail,
          })),
        },
      };
    } catch (error) {
      console.error("[get_orders] Error:", error);
      return { ok: false, error: "Failed to fetch orders" };
    }
  },
};

export const getOrderByIdTool: ToolDefinition = {
  name: "get_order_by_id",
  description: "Get detailed information about a specific order by its ID",
  parameters: getOrderByIdSchema,
  requiresConfirmation: false,
  handler: async (input): Promise<ToolResult> => {
    const { id } = input as z.infer<typeof getOrderByIdSchema>;

    try {
      const [job] = await db
        .select({
          id: jobs.id,
          referenceNumber: jobs.referenceNumber,
          status: jobs.status,
          jobType: jobs.jobType,
          pickupAddress: jobs.pickupAddress,
          deliveryAddress: jobs.deliveryAddress,
          moveDate: jobs.moveDate,
          distanceMiles: jobs.distanceMiles,
          estimatedPrice: jobs.estimatedPrice,
          finalPrice: jobs.finalPrice,
          description: jobs.description,
          contactName: jobs.contactName,
          contactPhone: jobs.contactPhone,
          customerName: users.name,
          customerEmail: users.email,
          createdAt: jobs.createdAt,
        })
        .from(jobs)
        .leftJoin(users, eq(jobs.customerId, users.id))
        .where(eq(jobs.id, id))
        .limit(1);

      if (!job) {
        return { ok: false, error: "Order not found" };
      }

      // Get associated booking if exists
      const [booking] = await db
        .select({
          id: bookings.id,
          orderNumber: bookings.orderNumber,
          paymentStatus: bookings.paymentStatus,
          finalPrice: bookings.finalPrice,
          driverId: bookings.driverId,
        })
        .from(bookings)
        .where(eq(bookings.jobId, id))
        .limit(1);

      return {
        ok: true,
        data: {
          order: {
            id: job.id,
            ref: job.referenceNumber,
            type: job.jobType,
            status: job.status,
            from: job.pickupAddress,
            to: job.deliveryAddress,
            date: job.moveDate?.toISOString(),
            distance: job.distanceMiles ? `${Number(job.distanceMiles).toFixed(1)} miles` : null,
            estimatedPrice: job.estimatedPrice ? `£${Number(job.estimatedPrice).toFixed(2)}` : null,
            finalPrice: job.finalPrice ? `£${Number(job.finalPrice).toFixed(2)}` : null,
            description: job.description,
            contact: {
              name: job.contactName,
              phone: job.contactPhone,
            },
            customer: {
              name: job.customerName,
              email: job.customerEmail,
            },
            created: job.createdAt?.toISOString(),
          },
          booking: booking
            ? {
                id: booking.id,
                orderNumber: booking.orderNumber,
                paymentStatus: booking.paymentStatus,
                finalPrice: booking.finalPrice ? `£${Number(booking.finalPrice).toFixed(2)}` : null,
                hasDriver: !!booking.driverId,
              }
            : null,
        },
      };
    } catch (error) {
      console.error("[get_order_by_id] Error:", error);
      return { ok: false, error: "Failed to fetch order details" };
    }
  },
};
