// ─── VanJet · Admin Job Detail Page ───────────────────────────
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { jobs, jobItems, quotes, users, bookings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Box, Flex, Text, SimpleGrid } from "@chakra-ui/react";import { formatGBP } from "@/lib/money/format";import Link from "next/link";
import { JobStatusForm } from "@/components/admin/JobStatusForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminJobDetailPage({ params }: Props) {
  const { id } = await params;

  const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  if (!job) notFound();

  const [items, jobQuotes, jobBookings, customer] = await Promise.all([
    db.select().from(jobItems).where(eq(jobItems.jobId, id)),
    db
      .select({
        id: quotes.id,
        price: quotes.price,
        message: quotes.message,
        status: quotes.status,
        driverId: quotes.driverId,
        createdAt: quotes.createdAt,
      })
      .from(quotes)
      .where(eq(quotes.jobId, id)),
    db.select().from(bookings).where(eq(bookings.jobId, id)),
    db
      .select({ name: users.name, email: users.email, phone: users.phone })
      .from(users)
      .where(eq(users.id, job.customerId))
      .limit(1),
  ]);

  const cust = customer[0];

  return (
    <Box>
      <Flex align="center" gap={3} mb={5}>
        <Link href="/admin/jobs">
          <Text color="blue.500" fontSize="sm" _hover={{ textDecoration: "underline" }}>
            ← Back to Jobs
          </Text>
        </Link>
        <Text fontSize="xl" fontWeight="700" color="gray.800">
          Job Details
        </Text>
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5}>
        {/* ── Core Info ──────────────────────────────── */}
        <Box bg="white" borderRadius="xl" p={5} borderWidth="1px" borderColor="gray.100">
          <Text fontWeight="600" fontSize="md" mb={3} color="gray.700">
            Job Info
          </Text>
          <InfoRow label="ID" value={job.id} />
          <InfoRow label="Type" value={job.jobType.replace("_", " ")} />
          <InfoRow label="Status" value={job.status} />
          <InfoRow label="Move Date" value={new Date(job.moveDate).toLocaleDateString("en-GB")} />
          <InfoRow label="Time Window" value={job.preferredTimeWindow || "—"} />
          <InfoRow label="Flexible Dates" value={job.flexibleDates ? "Yes" : "No"} />
          <InfoRow
            label="Est. Price"
            value={job.estimatedPrice ? formatGBP(Number(job.estimatedPrice)) : "—"}
          />
          <InfoRow
            label="Final Price"
            value={job.finalPrice ? formatGBP(Number(job.finalPrice)) : "—"}
          />
          <InfoRow
            label="Distance"
            value={job.distanceKm ? `${Number(job.distanceKm).toFixed(1)} mi` : "—"}
          />
        </Box>

        {/* ── Addresses ─────────────────────────────── */}
        <Box bg="white" borderRadius="xl" p={5} borderWidth="1px" borderColor="gray.100">
          <Text fontWeight="600" fontSize="md" mb={3} color="gray.700">
            Addresses
          </Text>
          <Text fontSize="sm" fontWeight="500" color="gray.500" mb={1}>
            Pickup
          </Text>
          <Text fontSize="sm" mb={1}>{job.pickupAddress}</Text>
          <Text fontSize="xs" color="gray.400" mb={3}>
            Floor: {job.pickupFloor ?? "—"} | Flat: {job.pickupFlat || "—"} | Lift:{" "}
            {job.pickupHasLift ? "Yes" : "No"}
          </Text>

          <Text fontSize="sm" fontWeight="500" color="gray.500" mb={1}>
            Delivery
          </Text>
          <Text fontSize="sm" mb={1}>{job.deliveryAddress}</Text>
          <Text fontSize="xs" color="gray.400">
            Floor: {job.deliveryFloor ?? "—"} | Flat: {job.deliveryFlat || "—"} | Lift:{" "}
            {job.deliveryHasLift ? "Yes" : "No"}
          </Text>
        </Box>

        {/* ── Customer ──────────────────────────────── */}
        <Box bg="white" borderRadius="xl" p={5} borderWidth="1px" borderColor="gray.100">
          <Text fontWeight="600" fontSize="md" mb={3} color="gray.700">
            Customer
          </Text>
          <InfoRow label="Name" value={cust?.name || job.contactName || "—"} />
          <InfoRow label="Email" value={cust?.email || "—"} />
          <InfoRow label="Phone" value={cust?.phone || job.contactPhone || "—"} />
        </Box>

        {/* ── Update Status ─────────────────────────── */}
        <Box bg="white" borderRadius="xl" p={5} borderWidth="1px" borderColor="gray.100">
          <Text fontWeight="600" fontSize="md" mb={3} color="gray.700">
            Update Status
          </Text>
          <JobStatusForm jobId={job.id} currentStatus={job.status} />
        </Box>
      </SimpleGrid>

      {/* ── Items ───────────────────────────────────── */}
      {items.length > 0 && (
        <Box mt={5}>
          <Text fontWeight="600" fontSize="md" mb={3} color="gray.700">
            Items ({items.length})
          </Text>
          <Box
            bg="white"
            borderRadius="lg"
            borderWidth="1px"
            borderColor="gray.100"
            overflowX="auto"
          >
            <Box as="table" w="full" fontSize="sm">
              <Box as="thead" bg="gray.50">
                <Box as="tr">
                  <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                    Item
                  </Box>
                  <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                    Category
                  </Box>
                  <Box as="th" textAlign="center" px={4} py={3} fontWeight="600" color="gray.600">
                    Qty
                  </Box>
                  <Box as="th" textAlign="right" px={4} py={3} fontWeight="600" color="gray.600">
                    Weight
                  </Box>
                  <Box as="th" textAlign="center" px={4} py={3} fontWeight="600" color="gray.600">
                    Fragile
                  </Box>
                </Box>
              </Box>
              <Box as="tbody">
                {items.map((item) => (
                  <Box
                    as="tr"
                    key={item.id}
                    borderTopWidth="1px"
                    borderColor="gray.100"
                  >
                    <Box as="td" px={4} py={3}>
                      {item.name}
                    </Box>
                    <Box as="td" px={4} py={3} color="gray.500">
                      {item.category || "—"}
                    </Box>
                    <Box as="td" px={4} py={3} textAlign="center">
                      {item.quantity}
                    </Box>
                    <Box as="td" px={4} py={3} textAlign="right">
                      {item.weightKg ? `${item.weightKg} kg` : "—"}
                    </Box>
                    <Box as="td" px={4} py={3} textAlign="center">
                      {item.fragile ? "⚠️ Yes" : "No"}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Quotes ──────────────────────────────────── */}
      {jobQuotes.length > 0 && (
        <Box mt={5}>
          <Text fontWeight="600" fontSize="md" mb={3} color="gray.700">
            Quotes ({jobQuotes.length})
          </Text>
          <Box
            bg="white"
            borderRadius="lg"
            borderWidth="1px"
            borderColor="gray.100"
            overflowX="auto"
          >
            <Box as="table" w="full" fontSize="sm">
              <Box as="thead" bg="gray.50">
                <Box as="tr">
                  <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                    Driver
                  </Box>
                  <Box as="th" textAlign="right" px={4} py={3} fontWeight="600" color="gray.600">
                    Price
                  </Box>
                  <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                    Message
                  </Box>
                  <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                    Status
                  </Box>
                  <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                    Date
                  </Box>
                </Box>
              </Box>
              <Box as="tbody">
                {jobQuotes.map((q) => (
                  <Box
                    as="tr"
                    key={q.id}
                    borderTopWidth="1px"
                    borderColor="gray.100"
                  >
                    <Box as="td" px={4} py={3} fontSize="xs" color="gray.500">
                      {q.driverId.slice(0, 8)}…
                    </Box>
                    <Box as="td" px={4} py={3} textAlign="right" fontWeight="500">
                      {formatGBP(Number(q.price))}
                    </Box>
                    <Box as="td" px={4} py={3} maxW="200px" truncate>
                      {q.message || "—"}
                    </Box>
                    <Box as="td" px={4} py={3} textTransform="capitalize" fontWeight="500">
                      {q.status}
                    </Box>
                    <Box as="td" px={4} py={3} color="gray.500">
                      {new Date(q.createdAt).toLocaleDateString("en-GB")}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Bookings ────────────────────────────────── */}
      {jobBookings.length > 0 && (
        <Box mt={5}>
          <Text fontWeight="600" fontSize="md" mb={3} color="gray.700">
            Bookings ({jobBookings.length})
          </Text>
          <Box
            bg="white"
            borderRadius="lg"
            borderWidth="1px"
            borderColor="gray.100"
            overflowX="auto"
          >
            <Box as="table" w="full" fontSize="sm">
              <Box as="thead" bg="gray.50">
                <Box as="tr">
                  <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                    Booking ID
                  </Box>
                  <Box as="th" textAlign="right" px={4} py={3} fontWeight="600" color="gray.600">
                    Final Price
                  </Box>
                  <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                    Payment
                  </Box>
                  <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                    Status
                  </Box>
                </Box>
              </Box>
              <Box as="tbody">
                {jobBookings.map((b) => (
                  <Box
                    as="tr"
                    key={b.id}
                    borderTopWidth="1px"
                    borderColor="gray.100"
                  >
                    <Box as="td" px={4} py={3} fontSize="xs" color="gray.500">
                      {b.id.slice(0, 8)}…
                    </Box>
                    <Box as="td" px={4} py={3} textAlign="right" fontWeight="500">
                      {formatGBP(Number(b.finalPrice))}
                    </Box>
                    <Box as="td" px={4} py={3} textTransform="capitalize">
                      {b.paymentStatus}
                    </Box>
                    <Box as="td" px={4} py={3} textTransform="capitalize">
                      {b.status}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Flex justify="space-between" py={1.5} borderBottomWidth="1px" borderColor="gray.50">
      <Text fontSize="sm" color="gray.500">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="500" textTransform="capitalize">
        {value}
      </Text>
    </Flex>
  );
}
