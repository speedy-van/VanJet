// ─── VanJet · Customer Data Queries (Server) ───────────────────
// Used by /my-bookings page and API.

import { db } from "@/lib/db";
import { jobs, bookings } from "@/lib/db/schema";
import { eq, desc, inArray } from "drizzle-orm";

export interface CustomerJobRow {
  id: string;
  referenceNumber: string;
  pickupAddress: string;
  deliveryAddress: string;
  moveDate: Date;
  status: string;
  estimatedPrice: string | null;
  createdAt: Date;
}

export interface CustomerBookingRow {
  id: string;
  jobId: string;
  orderNumber: string | null;
  finalPrice: string;
  paymentStatus: string;
  status: string;
  trackingToken: string | null;
  createdAt: Date;
}

export async function getCustomerJobsAndBookings(customerId: string) {
  const jobRows = await db
    .select({
      id: jobs.id,
      referenceNumber: jobs.referenceNumber,
      pickupAddress: jobs.pickupAddress,
      deliveryAddress: jobs.deliveryAddress,
      moveDate: jobs.moveDate,
      status: jobs.status,
      estimatedPrice: jobs.finalPrice,
      createdAt: jobs.createdAt,
    })
    .from(jobs)
    .where(eq(jobs.customerId, customerId))
    .orderBy(desc(jobs.createdAt));

  const jobIds = jobRows.map((j) => j.id);
  if (jobIds.length === 0) {
    return { jobs: jobRows, bookingsByJob: {} as Record<string, CustomerBookingRow[]> };
  }

  const bookingRows = await db
    .select({
      id: bookings.id,
      jobId: bookings.jobId,
      orderNumber: bookings.orderNumber,
      finalPrice: bookings.finalPrice,
      paymentStatus: bookings.paymentStatus,
      status: bookings.status,
      trackingToken: bookings.trackingToken,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .where(inArray(bookings.jobId, jobIds));

  const bookingsByJob: Record<string, CustomerBookingRow[]> = {};
  for (const b of bookingRows) {
    if (!bookingsByJob[b.jobId]) bookingsByJob[b.jobId] = [];
    bookingsByJob[b.jobId].push({
      id: b.id,
      jobId: b.jobId,
      orderNumber: b.orderNumber,
      finalPrice: b.finalPrice,
      paymentStatus: b.paymentStatus,
      status: b.status,
      trackingToken: b.trackingToken,
      createdAt: b.createdAt,
    });
  }

  return {
    jobs: jobRows as CustomerJobRow[],
    bookingsByJob,
  };
}
