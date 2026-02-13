// ─── VanJet · Driver Dashboard (Server Component) ────────────
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, driverProfiles, bookings, jobs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { DriverDashboardClient } from "@/components/driver/DriverDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Driver Dashboard | VanJet",
  robots: { index: false, follow: false },
};

export default async function DriverDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/driver/login");
  }

  const userId = (session.user as { id?: string }).id;
  const userRole = (session.user as { role?: string }).role;

  if (!userId || (userRole !== "driver" && userRole !== "admin")) {
    redirect("/driver/login");
  }

  // Fetch driver profile
  const [profile] = await db
    .select()
    .from(driverProfiles)
    .where(eq(driverProfiles.userId, userId))
    .limit(1);

  // Fetch user details
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  // Fetch assigned bookings
  const driverBookings = await db
    .select({
      bookingId: bookings.id,
      status: bookings.status,
      finalPrice: bookings.finalPrice,
      trackingToken: bookings.trackingToken,
      createdAt: bookings.createdAt,
      jobId: jobs.id,
      pickupAddress: jobs.pickupAddress,
      deliveryAddress: jobs.deliveryAddress,
      moveDate: jobs.moveDate,
      jobType: jobs.jobType,
    })
    .from(bookings)
    .innerJoin(jobs, eq(bookings.jobId, jobs.id))
    .where(eq(bookings.driverId, userId))
    .orderBy(desc(bookings.createdAt))
    .limit(20);

  const serialisedBookings = driverBookings.map((b) => ({
    ...b,
    moveDate: b.moveDate.toISOString(),
    createdAt: b.createdAt.toISOString(),
  }));

  return (
    <DriverDashboardClient
      user={{
        name: user?.name ?? "Driver",
        email: user?.email ?? "",
      }}
      profile={
        profile
          ? {
              companyName: profile.companyName,
              vanSize: profile.vanSize,
              coverageRadius: profile.coverageRadius,
              verified: profile.verified,
              rating: profile.rating,
              totalJobs: profile.totalJobs,
              bio: profile.bio,
            }
          : null
      }
      bookings={serialisedBookings}
    />
  );
}
