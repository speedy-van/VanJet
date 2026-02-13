// ─── VanJet · Admin Booking Detail Page (Server) ──────────────
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  bookings,
  jobs,
  jobItems,
  users,
  adminAuditLogs,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Box, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import { BookingManagement } from "@/components/admin/BookingManagement";
import { JOB_TYPE_LABELS } from "@/lib/pricing/rates";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminBookingDetailPage({ params }: Props) {
  const { id } = await params;

  // Fetch booking
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);

  if (!booking) notFound();

  // Fetch related data in parallel
  const [jobRows, items, auditLogs] = await Promise.all([
    db.select().from(jobs).where(eq(jobs.id, booking.jobId)).limit(1),
    db.select().from(jobItems).where(eq(jobItems.jobId, booking.jobId)),
    db
      .select()
      .from(adminAuditLogs)
      .where(eq(adminAuditLogs.bookingId, id))
      .orderBy(desc(adminAuditLogs.createdAt)),
  ]);

  const job = jobRows[0];
  if (!job) notFound();

  // Fetch customer
  const [customer] = await db
    .select({ name: users.name, email: users.email, phone: users.phone })
    .from(users)
    .where(eq(users.id, job.customerId))
    .limit(1);

  // Serialize for client component
  const serializedBooking = {
    id: booking.id,
    jobId: booking.jobId,
    quoteId: booking.quoteId,
    driverId: booking.driverId,
    finalPrice: booking.finalPrice,
    stripePaymentIntentId: booking.stripePaymentIntentId,
    paymentStatus: booking.paymentStatus,
    status: booking.status,
    cancelledAt: booking.cancelledAt?.toISOString() ?? null,
    cancelledReason: booking.cancelledReason ?? null,
    priceBreakdown: booking.priceBreakdown ?? null,
    repricedAt: booking.repricedAt?.toISOString() ?? null,
    repricedBy: booking.repricedBy ?? null,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  };

  const serializedJob = {
    id: job.id,
    customerId: job.customerId,
    jobType: job.jobType,
    status: job.status,
    pickupAddress: job.pickupAddress,
    pickupLat: job.pickupLat,
    pickupLng: job.pickupLng,
    deliveryAddress: job.deliveryAddress,
    deliveryLat: job.deliveryLat,
    deliveryLng: job.deliveryLng,
    distanceKm: job.distanceKm,
    moveDate: job.moveDate.toISOString(),
    description: job.description,
    estimatedPrice: job.estimatedPrice,
    finalPrice: job.finalPrice,
    pickupFloor: job.pickupFloor,
    pickupFlat: job.pickupFlat,
    pickupHasLift: job.pickupHasLift,
    pickupNotes: job.pickupNotes,
    deliveryFloor: job.deliveryFloor,
    deliveryFlat: job.deliveryFlat,
    deliveryHasLift: job.deliveryHasLift,
    deliveryNotes: job.deliveryNotes,
    preferredTimeWindow: job.preferredTimeWindow,
    flexibleDates: job.flexibleDates,
    contactName: job.contactName,
    contactPhone: job.contactPhone,
    createdAt: job.createdAt.toISOString(),
  };

  const serializedItems = items.map((i) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    quantity: i.quantity,
    weightKg: i.weightKg,
    volumeM3: i.volumeM3,
    requiresDismantling: i.requiresDismantling,
    fragile: i.fragile,
    notes: i.notes,
  }));

  const serializedLogs = auditLogs.map((l) => ({
    id: l.id,
    createdAt: l.createdAt.toISOString(),
    adminUserId: l.adminUserId,
    action: l.action,
    diffJson: l.diffJson,
    note: l.note,
  }));

  // Build job type options from pricing rates
  const jobTypeOptions = Object.entries(JOB_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <Box>
      <Flex align="center" gap={3} mb={5}>
        <Link href="/admin/bookings">
          <Text
            color="blue.500"
            fontSize="sm"
            _hover={{ textDecoration: "underline" }}
          >
            ← Back to Bookings
          </Text>
        </Link>
        <Text fontSize="xl" fontWeight="700" color="gray.800">
          Booking Details
        </Text>
      </Flex>

      {/* Booking summary info (static) */}
      <Flex gap={3} mb={4} flexWrap="wrap">
        <StatusBadge label={booking.status} type="status" />
        <StatusBadge label={booking.paymentStatus} type="payment" />
        {booking.repricedAt && (
          <Box
            px={2}
            py={0.5}
            borderRadius="full"
            bg="blue.50"
            color="blue.700"
            fontSize="xs"
            fontWeight="600"
          >
            Repriced
          </Box>
        )}
      </Flex>

      {/* Customer info */}
      <Box
        bg="white"
        borderRadius="xl"
        p={4}
        mb={4}
        borderWidth="1px"
        borderColor="gray.100"
      >
        <Text fontWeight="600" fontSize="sm" mb={2} color="gray.500">
          Customer
        </Text>
        <Text fontSize="sm">
          {customer?.name || job.contactName || "—"} ·{" "}
          {customer?.email || "—"} ·{" "}
          {customer?.phone || job.contactPhone || "—"}
        </Text>
      </Box>

      {/* Interactive management component */}
      <BookingManagement
        booking={serializedBooking}
        job={serializedJob}
        items={serializedItems}
        auditLogs={serializedLogs}
        jobTypeOptions={jobTypeOptions}
      />
    </Box>
  );
}

function StatusBadge({
  label,
  type,
}: {
  label: string;
  type: "status" | "payment";
}) {
  const statusColors: Record<string, { bg: string; color: string }> = {
    confirmed: { bg: "blue.50", color: "blue.700" },
    in_progress: { bg: "orange.50", color: "orange.700" },
    completed: { bg: "green.50", color: "green.700" },
    cancelled: { bg: "red.50", color: "red.700" },
  };
  const paymentColors: Record<string, { bg: string; color: string }> = {
    unpaid: { bg: "yellow.100", color: "yellow.800" },
    paid: { bg: "green.100", color: "green.800" },
    refunded: { bg: "red.100", color: "red.800" },
  };

  const colors =
    type === "status" ? statusColors : paymentColors;
  const c = colors[label] ?? { bg: "gray.100", color: "gray.800" };

  return (
    <Box
      px={3}
      py={0.5}
      borderRadius="full"
      bg={c.bg}
      color={c.color}
      fontSize="xs"
      fontWeight="600"
      textTransform="capitalize"
    >
      {type === "status" ? "Status: " : "Payment: "}
      {label.replace("_", " ")}
    </Box>
  );
}
