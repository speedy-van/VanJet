// ─── VanJet · AI Agent Report Tools ───────────────────────────
import { z } from "zod";
import { db } from "@/lib/db";
import { bookings, jobs, users, driverProfiles, visitors, visitEvents } from "@/lib/db/schema";
import { eq, count, sql, gte, and, desc } from "drizzle-orm";
import type { ToolDefinition, ToolResult } from "./index";

// ── Report Bookings ─────────────────────────────────────────────
const reportBookingsSchema = z.object({
  days: z.number().min(1).max(365).optional().default(30),
});

export const reportBookingsTool: ToolDefinition = {
  name: "report_bookings",
  description: "Generate a summary report of bookings: total count, by status, by payment status, revenue. Optional days filter (default 30).",
  parameters: reportBookingsSchema,
  requiresConfirmation: false,
  handler: async (input): Promise<ToolResult> => {
    const { days } = input as z.infer<typeof reportBookingsSchema>;
    const since = new Date();
    since.setDate(since.getDate() - days);

    try {
      // Total bookings in period
      const [total] = await db
        .select({ count: count() })
        .from(bookings)
        .where(gte(bookings.createdAt, since));

      // By status
      const byStatus = await db
        .select({
          status: bookings.status,
          count: count(),
        })
        .from(bookings)
        .where(gte(bookings.createdAt, since))
        .groupBy(bookings.status);

      // By payment status
      const byPayment = await db
        .select({
          paymentStatus: bookings.paymentStatus,
          count: count(),
        })
        .from(bookings)
        .where(gte(bookings.createdAt, since))
        .groupBy(bookings.paymentStatus);

      // Revenue (paid bookings)
      const [revenue] = await db
        .select({
          total: sql<string>`COALESCE(SUM(${bookings.finalPrice}::numeric), 0)`,
        })
        .from(bookings)
        .where(
          and(
            gte(bookings.createdAt, since),
            eq(bookings.paymentStatus, "paid")
          )
        );

      return {
        ok: true,
        data: {
          period: `${days} days`,
          totalBookings: total?.count ?? 0,
          byStatus: byStatus.map((s) => ({ status: s.status, count: s.count })),
          byPayment: byPayment.map((p) => ({ status: p.paymentStatus, count: p.count })),
          revenue: `£${Number(revenue?.total ?? 0).toFixed(2)}`,
        },
      };
    } catch (error) {
      console.error("[report_bookings] Error:", error);
      return { ok: false, error: "Failed to generate bookings report" };
    }
  },
};

// ── Report Drivers ──────────────────────────────────────────────
const reportDriversSchema = z.object({});

export const reportDriversTool: ToolDefinition = {
  name: "report_drivers",
  description: "Generate a summary report of drivers: total, verified vs unverified, by application status, average rating.",
  parameters: reportDriversSchema,
  requiresConfirmation: false,
  handler: async (): Promise<ToolResult> => {
    try {
      const [total] = await db
        .select({ count: count() })
        .from(driverProfiles);

      const byVerified = await db
        .select({
          verified: driverProfiles.verified,
          count: count(),
        })
        .from(driverProfiles)
        .groupBy(driverProfiles.verified);

      const byAppStatus = await db
        .select({
          status: driverProfiles.applicationStatus,
          count: count(),
        })
        .from(driverProfiles)
        .groupBy(driverProfiles.applicationStatus);

      const [avgRating] = await db
        .select({
          avg: sql<string>`COALESCE(AVG(${driverProfiles.rating}::numeric), 0)`,
        })
        .from(driverProfiles)
        .where(eq(driverProfiles.verified, true));

      return {
        ok: true,
        data: {
          totalDrivers: total?.count ?? 0,
          byVerified: byVerified.map((v) => ({
            verified: v.verified,
            count: v.count,
          })),
          byApplicationStatus: byAppStatus.map((s) => ({
            status: s.status,
            count: s.count,
          })),
          averageRating: Number(avgRating?.avg ?? 0).toFixed(2),
        },
      };
    } catch (error) {
      console.error("[report_drivers] Error:", error);
      return { ok: false, error: "Failed to generate drivers report" };
    }
  },
};

// ── Report Visitors ─────────────────────────────────────────────
const reportVisitorsSchema = z.object({
  days: z.number().min(1).max(365).optional().default(7),
});

export const reportVisitorsTool: ToolDefinition = {
  name: "report_visitors",
  description: "Generate a summary report of website visitors: total unique, new vs returning, top countries, top pages, device breakdown. Optional days filter (default 7).",
  parameters: reportVisitorsSchema,
  requiresConfirmation: false,
  handler: async (input): Promise<ToolResult> => {
    const { days } = input as z.infer<typeof reportVisitorsSchema>;
    const since = new Date();
    since.setDate(since.getDate() - days);

    try {
      // Total unique visitors in period
      const [totalVisitors] = await db
        .select({ count: count() })
        .from(visitors)
        .where(gte(visitors.lastSeenAt, since));

      // New visitors (first seen in this period)
      const [newVisitors] = await db
        .select({ count: count() })
        .from(visitors)
        .where(gte(visitors.firstSeenAt, since));

      // Top countries
      const topCountries = await db
        .select({
          country: visitors.country,
          count: count(),
        })
        .from(visitors)
        .where(gte(visitors.lastSeenAt, since))
        .groupBy(visitors.country)
        .orderBy(desc(count()))
        .limit(5);

      // Top pages
      const topPages = await db
        .select({
          path: visitEvents.path,
          count: count(),
        })
        .from(visitEvents)
        .where(gte(visitEvents.createdAt, since))
        .groupBy(visitEvents.path)
        .orderBy(desc(count()))
        .limit(5);

      // Device breakdown
      const deviceBreakdown = await db
        .select({
          deviceType: visitors.deviceType,
          count: count(),
        })
        .from(visitors)
        .where(gte(visitors.lastSeenAt, since))
        .groupBy(visitors.deviceType);

      return {
        ok: true,
        data: {
          period: `${days} days`,
          totalVisitors: totalVisitors?.count ?? 0,
          newVisitors: newVisitors?.count ?? 0,
          returningVisitors: (totalVisitors?.count ?? 0) - (newVisitors?.count ?? 0),
          topCountries: topCountries.map((c) => ({
            country: c.country ?? "Unknown",
            count: c.count,
          })),
          topPages: topPages.map((p) => ({
            page: p.path,
            views: p.count,
          })),
          deviceBreakdown: deviceBreakdown.map((d) => ({
            device: d.deviceType ?? "unknown",
            count: d.count,
          })),
        },
      };
    } catch (error) {
      console.error("[report_visitors] Error:", error);
      return { ok: false, error: "Failed to generate visitors report" };
    }
  },
};

// ── Get Current Admin ───────────────────────────────────────────
const getCurrentAdminSchema = z.object({});

export const getCurrentAdminTool: ToolDefinition = {
  name: "get_current_admin",
  description: "Get the currently logged-in admin's profile (name, email, role). Useful for personalization.",
  parameters: getCurrentAdminSchema,
  requiresConfirmation: false,
  handler: async (_input: unknown, adminId: string): Promise<ToolResult> => {
    try {
      const [admin] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, adminId))
        .limit(1);

      if (!admin) {
        return { ok: false, error: "Admin not found" };
      }

      return {
        ok: true,
        data: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          memberSince: admin.createdAt?.toISOString(),
        },
      };
    } catch (error) {
      console.error("[get_current_admin] Error:", error);
      return { ok: false, error: "Failed to get admin info" };
    }
  },
};
