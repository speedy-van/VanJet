// ─── VanJet · Reviews Queries ──────────────────────────────────
// Server-side only. For public display and API.

import { db } from "@/lib/db";
import { reviews, users, bookings, jobs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export interface PublicReview {
  id: string;
  name: string;
  location: string | null;
  rating: number;
  date: string;
  text: string;
}

/**
 * Fetch recent reviews for public display.
 * Joins reviewer name and optional location from job pickup address.
 */
export async function getPublicReviews(limit = 50): Promise<PublicReview[]> {
  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      reviewerName: users.name,
      pickupAddress: jobs.pickupAddress,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.reviewerId, users.id))
    .innerJoin(bookings, eq(reviews.bookingId, bookings.id))
    .innerJoin(jobs, eq(bookings.jobId, jobs.id))
    .orderBy(desc(reviews.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    name: maskReviewerName(r.reviewerName),
    location: extractCityFromAddress(r.pickupAddress),
    rating: r.rating,
    date: formatReviewDate(r.createdAt),
    text: r.comment ?? "",
  }));
}

function maskReviewerName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "Customer";
  if (parts.length === 1) return `${parts[0][0]}.`;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function extractCityFromAddress(address: string | null): string | null {
  if (!address || !address.trim()) return null;
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length >= 2) return parts[parts.length - 2] ?? null;
  return parts[0] || null;
}

function formatReviewDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}
