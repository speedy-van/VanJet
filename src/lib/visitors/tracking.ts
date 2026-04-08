// ─── VanJet · Visitor Tracking Utility ────────────────────────
// Tracks visitors and events with IP geolocation

import { db } from "@/lib/db";
import { visitors, visitEvents } from "@/lib/db/schema";
import { eq, gte, sql } from "drizzle-orm";
import { UAParser } from "ua-parser-js";
import { headers } from "next/headers";
import crypto from "crypto";

const IP_GEO_PROVIDER_URL = process.env.IP_GEO_PROVIDER_URL || "";

interface GeoData {
  country?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
}

// Get client IP from request headers
export async function getClientIP(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIP = headersList.get("x-real-ip");
  
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  
  return realIP || "unknown";
}

// Hash IP for privacy-preserving storage
export function hashIP(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").substring(0, 64);
}

// Generate visitor fingerprint from IP + User Agent
export function generateFingerprint(ip: string, userAgent: string): string {
  const raw = `${ip}::${userAgent}`;
  return crypto.createHash("sha256").update(raw).digest("hex").substring(0, 64);
}

// Parse user agent
export function parseUserAgent(userAgent: string) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  return {
    browser: result.browser.name || "Unknown",
    browserVersion: result.browser.version || "",
    os: result.os.name || "Unknown",
    osVersion: result.os.version || "",
    deviceType: result.device.type || "desktop",
    deviceVendor: result.device.vendor || "",
    deviceModel: result.device.model || "",
  };
}

// Fetch geolocation from IP
export async function fetchGeoLocation(ip: string): Promise<GeoData> {
  if (!IP_GEO_PROVIDER_URL || ip === "unknown" || ip.startsWith("127.") || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return {};
  }

  try {
    const url = IP_GEO_PROVIDER_URL.replace("{ip}", ip);
    const res = await fetch(url, { 
      next: { revalidate: 86400 }, // Cache for 24 hours
    });
    
    if (!res.ok) return {};
    
    const data = await res.json();
    
    // Support common geo API formats
    return {
      country: data.country_name || data.country || data.countryName,
      city: data.city,
      region: data.region || data.region_name || data.regionName,
      latitude: data.latitude || data.lat,
      longitude: data.longitude || data.lon || data.lng,
      timezone: data.timezone || data.time_zone,
      isp: data.isp || data.org,
    };
  } catch (error) {
    console.error("[Visitors] Geo lookup error:", error);
    return {};
  }
}

// Track a visitor and return visitor record
export async function trackVisitor(options?: {
  ip?: string;
  userAgent?: string;
}) {
  const ip = options?.ip || await getClientIP();
  const headersList = await headers();
  const ua = options?.userAgent || headersList.get("user-agent") || "";
  
  const fingerprint = generateFingerprint(ip, ua);
  const ipHash = hashIP(ip);
  
  // Check for existing visitor by fingerprint
  const existing = await db.query.visitors.findFirst({
    where: eq(visitors.fingerprint, fingerprint),
  });

  const parsed = parseUserAgent(ua);
  const geo = await fetchGeoLocation(ip);

  if (existing) {
    // Update existing visitor
    await db
      .update(visitors)
      .set({
        lastSeenAt: new Date(),
        visitCount: sql`${visitors.visitCount} + 1`,
        browser: parsed.browser,
        os: parsed.os,
        deviceType: parsed.deviceType,
      })
      .where(eq(visitors.id, existing.id));

    return { visitor: existing, isNew: false };
  }

  // Create new visitor
  const [visitor] = await db
    .insert(visitors)
    .values({
      fingerprint,
      ipHash,
      userAgent: ua.substring(0, 1000),
      browser: parsed.browser,
      browserVersion: parsed.browserVersion,
      os: parsed.os,
      osVersion: parsed.osVersion,
      deviceType: parsed.deviceType,
      country: geo.country,
      city: geo.city,
      region: geo.region,
      lat: geo.latitude?.toString(),
      lng: geo.longitude?.toString(),
      timezone: geo.timezone,
      isp: geo.isp,
      visitCount: 1,
      firstSeenAt: new Date(),
      lastSeenAt: new Date(),
    })
    .returning();

  return { visitor, isNew: true };
}

// Track a page view event
export async function trackPageView(
  visitorId: string,
  path: string,
  data?: {
    referrer?: string;
    durationMs?: number;
  }
) {
  await db.insert(visitEvents).values({
    visitorId,
    path,
    referrer: data?.referrer,
    durationMs: data?.durationMs,
    createdAt: new Date(),
  });
}

// Get visitor stats for dashboard
export async function getVisitorStats(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Total visitors
  const totalResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(visitors)
    .where(gte(visitors.lastSeenAt, startDate));

  // New visitors (first visit within period)
  const newResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(visitors)
    .where(gte(visitors.firstSeenAt, startDate));

  // Visitors by country
  const byCountry = await db
    .select({
      country: visitors.country,
      count: sql<number>`count(*)::int`,
    })
    .from(visitors)
    .where(gte(visitors.lastSeenAt, startDate))
    .groupBy(visitors.country)
    .orderBy(sql`count(*) desc`)
    .limit(10);

  // Visitors by device
  const byDevice = await db
    .select({
      device: visitors.deviceType,
      count: sql<number>`count(*)::int`,
    })
    .from(visitors)
    .where(gte(visitors.lastSeenAt, startDate))
    .groupBy(visitors.deviceType);

  // Visitors by browser
  const byBrowser = await db
    .select({
      browser: visitors.browser,
      count: sql<number>`count(*)::int`,
    })
    .from(visitors)
    .where(gte(visitors.lastSeenAt, startDate))
    .groupBy(visitors.browser)
    .orderBy(sql`count(*) desc`)
    .limit(10);

  // Daily visitors trend
  const dailyTrend = await db
    .select({
      date: sql<string>`DATE(${visitors.lastSeenAt})::text`,
      count: sql<number>`count(*)::int`,
    })
    .from(visitors)
    .where(gte(visitors.lastSeenAt, startDate))
    .groupBy(sql`DATE(${visitors.lastSeenAt})`)
    .orderBy(sql`DATE(${visitors.lastSeenAt})`);

  return {
    total: totalResult[0]?.count || 0,
    new: newResult[0]?.count || 0,
    returning: (totalResult[0]?.count || 0) - (newResult[0]?.count || 0),
    byCountry,
    byDevice,
    byBrowser,
    dailyTrend,
  };
}

// Get page view stats
export async function getPageViewStats(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Total page views
  const totalResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(visitEvents)
    .where(gte(visitEvents.createdAt, startDate));

  // Top pages
  const topPages = await db
    .select({
      page: visitEvents.path,
      count: sql<number>`count(*)::int`,
    })
    .from(visitEvents)
    .where(gte(visitEvents.createdAt, startDate))
    .groupBy(visitEvents.path)
    .orderBy(sql`count(*) desc`)
    .limit(10);

  return {
    total: totalResult[0]?.count || 0,
    topPages,
  };
}

// Get recent visitors for admin list
export async function getRecentVisitors(options: {
  page?: number;
  limit?: number;
} = {}) {
  const page = options.page || 1;
  const limit = options.limit || 50;
  const offset = (page - 1) * limit;

  const [records, countResult] = await Promise.all([
    db.query.visitors.findMany({
      orderBy: (v, { desc }) => [desc(v.lastSeenAt)],
      limit,
      offset,
    }),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(visitors),
  ]);

  return {
    visitors: records,
    total: countResult[0]?.count || 0,
    page,
    pageSize: limit,
    totalPages: Math.ceil((countResult[0]?.count || 0) / limit),
  };
}
