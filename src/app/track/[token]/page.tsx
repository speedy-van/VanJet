// ─── VanJet · Live Tracking Page (Server Component) ───────────
import { db } from "@/lib/db";
import { bookings, jobs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { LiveTracking } from "@/components/tracking/LiveTracking";
import type { Metadata } from "next";

interface TrackingPageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({
  params,
}: TrackingPageProps): Promise<Metadata> {
  const { token } = await params;
  return {
    title: `Live Tracking | VanJet`,
    description: `Track your delivery in real-time with VanJet.`,
    robots: { index: false, follow: false },
    openGraph: {
      title: "Live Tracking | VanJet",
      description: "Track your delivery in real-time.",
      url: `${process.env.NEXT_PUBLIC_URL || "https://van-jet.com"}/track/${token}`,
    },
  };
}

export default async function TrackingPage({ params }: TrackingPageProps) {
  const { token } = await params;

  // Validate the token and fetch booking + job
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.trackingToken, token))
    .limit(1);

  if (!booking || !booking.trackingEnabled) {
    notFound();
  }

  const [job] = await db
    .select({
      pickupAddress: jobs.pickupAddress,
      pickupLat: jobs.pickupLat,
      pickupLng: jobs.pickupLng,
      deliveryAddress: jobs.deliveryAddress,
      deliveryLat: jobs.deliveryLat,
      deliveryLng: jobs.deliveryLng,
      moveDate: jobs.moveDate,
      jobType: jobs.jobType,
    })
    .from(jobs)
    .where(eq(jobs.id, booking.jobId))
    .limit(1);

  if (!job) {
    notFound();
  }

  // Prepare safe data for client (no secrets)
  const trackingData = {
    token,
    bookingStatus: booking.status,
    pickup: {
      address: job.pickupAddress,
      lat: job.pickupLat ? Number(job.pickupLat) : null,
      lng: job.pickupLng ? Number(job.pickupLng) : null,
    },
    delivery: {
      address: job.deliveryAddress,
      lat: job.deliveryLat ? Number(job.deliveryLat) : null,
      lng: job.deliveryLng ? Number(job.deliveryLng) : null,
    },
    moveDate: job.moveDate.toISOString(),
    jobType: job.jobType,
  };

  return <LiveTracking data={trackingData} />;
}
