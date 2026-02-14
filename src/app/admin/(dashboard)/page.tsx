// ─── VanJet · Admin Dashboard ─────────────────────────────────
import { db } from "@/lib/db";
import { users, jobs, bookings, driverProfiles, quotes } from "@/lib/db/schema";
import { count, sum, eq } from "drizzle-orm";
import { Box, Flex, Text, SimpleGrid } from "@chakra-ui/react";import { formatGBP } from "@/lib/money/format";
async function getStats() {
  const [
    [jobCount],
    [bookingCount],
    [driverCount],
    [userCount],
    [quoteCount],
    [revenueResult],
  ] = await Promise.all([
    db.select({ value: count() }).from(jobs),
    db.select({ value: count() }).from(bookings),
    db.select({ value: count() }).from(driverProfiles),
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(quotes),
    db
      .select({ value: sum(bookings.finalPrice) })
      .from(bookings)
      .where(eq(bookings.paymentStatus, "paid")),
  ]);

  return {
    jobs: jobCount.value,
    bookings: bookingCount.value,
    drivers: driverCount.value,
    users: userCount.value,
    quotes: quoteCount.value,
    revenue: revenueResult.value ?? "0",
  };
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Box bg="white" borderRadius="xl" shadow="sm" p={5} borderWidth="1px" borderColor="gray.100">
      <Text fontSize="sm" color="gray.500" fontWeight="500" mb={1}>
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="700" color={color}>
        {value}
      </Text>
    </Box>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <Box>
      <Text fontSize="xl" fontWeight="700" mb={5} color="gray.800">
        Overview
      </Text>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
        <StatCard label="Total Jobs" value={stats.jobs} color="blue.600" />
        <StatCard label="Bookings" value={stats.bookings} color="green.600" />
        <StatCard label="Drivers" value={stats.drivers} color="purple.600" />
        <StatCard label="Users" value={stats.users} color="cyan.600" />
        <StatCard label="Quotes" value={stats.quotes} color="orange.600" />
        <StatCard
          label="Revenue (Paid)"
          value={formatGBP(Number(stats.revenue))}
          color="green.700"
        />
      </SimpleGrid>

      {/* Recent Jobs */}
      <Box mt={8}>
        <Text fontSize="lg" fontWeight="600" mb={3} color="gray.800">
          Recent Jobs
        </Text>
        <RecentJobsTable />
      </Box>
    </Box>
  );
}

async function RecentJobsTable() {
  const recentJobs = await db
    .select({
      id: jobs.id,
      pickupAddress: jobs.pickupAddress,
      deliveryAddress: jobs.deliveryAddress,
      status: jobs.status,
      estimatedPrice: jobs.estimatedPrice,
      moveDate: jobs.moveDate,
      createdAt: jobs.createdAt,
    })
    .from(jobs)
    .orderBy(jobs.createdAt)
    .limit(10);

  if (recentJobs.length === 0) {
    return (
      <Box bg="white" borderRadius="lg" p={6} borderWidth="1px" borderColor="gray.100">
        <Text color="gray.500" textAlign="center">
          No jobs yet.
        </Text>
      </Box>
    );
  }

  return (
    <Box bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.100" overflowX="auto">
      <Box as="table" w="full" fontSize="sm">
        <Box as="thead" bg="gray.50">
          <Box as="tr">
            <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
              Pickup
            </Box>
            <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
              Delivery
            </Box>
            <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
              Status
            </Box>
            <Box as="th" textAlign="right" px={4} py={3} fontWeight="600" color="gray.600">
              Est. Price
            </Box>
            <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
              Date
            </Box>
          </Box>
        </Box>
        <Box as="tbody">
          {recentJobs.map((job) => (
            <Box
              as="tr"
              key={job.id}
              borderTopWidth="1px"
              borderColor="gray.100"
              _hover={{ bg: "gray.50" }}
            >
              <Box as="td" px={4} py={3} maxW="200px" truncate>
                {job.pickupAddress}
              </Box>
              <Box as="td" px={4} py={3} maxW="200px" truncate>
                {job.deliveryAddress}
              </Box>
              <Box as="td" px={4} py={3}>
                <StatusBadge status={job.status} />
              </Box>
              <Box as="td" px={4} py={3} textAlign="right" fontWeight="500">
                {job.estimatedPrice ? formatGBP(Number(job.estimatedPrice)) : "—"}
              </Box>
              <Box as="td" px={4} py={3} color="gray.500">
                {new Date(job.moveDate).toLocaleDateString("en-GB")}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    pending: { bg: "yellow.100", color: "yellow.800" },
    quoted: { bg: "blue.100", color: "blue.800" },
    accepted: { bg: "cyan.100", color: "cyan.800" },
    in_progress: { bg: "purple.100", color: "purple.800" },
    completed: { bg: "green.100", color: "green.800" },
    cancelled: { bg: "red.100", color: "red.800" },
  };
  const c = colors[status] ?? { bg: "gray.100", color: "gray.800" };

  return (
    <Flex
      display="inline-flex"
      px={2}
      py={0.5}
      borderRadius="full"
      bg={c.bg}
      color={c.color}
      fontSize="xs"
      fontWeight="600"
      textTransform="capitalize"
    >
      {status.replace("_", " ")}
    </Flex>
  );
}
