// ─── VanJet · Admin Driver Applications Page ─────────────────
import { db } from "@/lib/db";
import { driverProfiles, users } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { Box, Flex, Text, SimpleGrid } from "@chakra-ui/react";
import Link from "next/link";
import { ApplicationActions } from "@/components/admin/ApplicationActions";

const LIMIT = 20;

interface Props {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function AdminApplicationsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const statusFilter = params.status || "pending";
  const offset = (page - 1) * LIMIT;

  const condition =
    statusFilter === "all"
      ? undefined
      : eq(driverProfiles.applicationStatus, statusFilter);

  const [rows, [totalResult], [pendingCount], [approvedCount], [rejectedCount]] =
    await Promise.all([
      db
        .select({
          id: driverProfiles.id,
          userId: driverProfiles.userId,
          companyName: driverProfiles.companyName,
          vanSize: driverProfiles.vanSize,
          coverageRadius: driverProfiles.coverageRadius,
          bio: driverProfiles.bio,
          applicationStatus: driverProfiles.applicationStatus,
          rejectionReason: driverProfiles.rejectionReason,
          reviewedAt: driverProfiles.reviewedAt,
          reviewedBy: driverProfiles.reviewedBy,
          verified: driverProfiles.verified,
          createdAt: driverProfiles.createdAt,
          userName: users.name,
          userEmail: users.email,
          userPhone: users.phone,
        })
        .from(driverProfiles)
        .innerJoin(users, eq(driverProfiles.userId, users.id))
        .where(condition)
        .orderBy(desc(driverProfiles.createdAt))
        .limit(LIMIT)
        .offset(offset),
      db.select({ value: count() }).from(driverProfiles).where(condition),
      db
        .select({ value: count() })
        .from(driverProfiles)
        .where(eq(driverProfiles.applicationStatus, "pending")),
      db
        .select({ value: count() })
        .from(driverProfiles)
        .where(eq(driverProfiles.applicationStatus, "approved")),
      db
        .select({ value: count() })
        .from(driverProfiles)
        .where(eq(driverProfiles.applicationStatus, "rejected")),
    ]);

  const total = totalResult.value;
  const totalPages = Math.ceil(total / LIMIT);

  const filters = [
    { label: "Pending", value: "pending", count: pendingCount.value },
    { label: "Approved", value: "approved", count: approvedCount.value },
    { label: "Rejected", value: "rejected", count: rejectedCount.value },
    { label: "All", value: "all", count: null },
  ];

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={2}>
        <Text fontSize="xl" fontWeight="700" color="gray.800">
          Driver Applications
        </Text>
        <Link href="/admin/drivers">
          <Box
            px={3}
            py={1}
            borderRadius="md"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            fontSize="sm"
            _hover={{ bg: "gray.100" }}
            cursor="pointer"
          >
            ← All Drivers
          </Box>
        </Link>
      </Flex>

      {/* Stats */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={3} mb={4}>
        <StatCard label="Pending" value={pendingCount.value} color="yellow" />
        <StatCard label="Approved" value={approvedCount.value} color="green" />
        <StatCard label="Rejected" value={rejectedCount.value} color="red" />
        <StatCard
          label="Total"
          value={pendingCount.value + approvedCount.value + rejectedCount.value}
          color="blue"
        />
      </SimpleGrid>

      {/* Filters */}
      <Flex gap={2} mb={4} flexWrap="wrap">
        {filters.map((f) => {
          const isActive = statusFilter === f.value;
          const href = `/admin/applications?status=${f.value}`;
          return (
            <a key={f.value} href={href}>
              <Box
                px={3}
                py={1}
                borderRadius="full"
                fontSize="sm"
                fontWeight={isActive ? "600" : "400"}
                bg={isActive ? "blue.500" : "white"}
                color={isActive ? "white" : "gray.600"}
                borderWidth="1px"
                borderColor={isActive ? "blue.500" : "gray.200"}
                _hover={{ bg: isActive ? "blue.600" : "gray.100" }}
                cursor="pointer"
              >
                {f.label}
                {f.count !== null && (
                  <Box
                    as="span"
                    ml={1.5}
                    px={1.5}
                    py={0.5}
                    borderRadius="full"
                    fontSize="xs"
                    bg={isActive ? "whiteAlpha.300" : "gray.100"}
                    color={isActive ? "white" : "gray.500"}
                  >
                    {f.count}
                  </Box>
                )}
              </Box>
            </a>
          );
        })}
      </Flex>

      {/* Application Cards */}
      {rows.length === 0 ? (
        <Box
          bg="white"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="gray.100"
          p={8}
          textAlign="center"
        >
          <Text fontSize="lg" mb={1}>📭</Text>
          <Text color="gray.500" fontSize="sm">
            No {statusFilter === "all" ? "" : statusFilter} applications found.
          </Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
          {rows.map((app) => (
            <Box
              key={app.id}
              bg="white"
              borderRadius="lg"
              borderWidth="1px"
              borderColor={
                app.applicationStatus === "pending"
                  ? "yellow.200"
                  : app.applicationStatus === "approved"
                    ? "green.200"
                    : "red.200"
              }
              p={4}
              shadow="sm"
            >
              {/* Top: Name + Status Badge */}
              <Flex justify="space-between" align="flex-start" mb={3}>
                <Box>
                  <Text fontWeight="700" fontSize="md" color="gray.800">
                    {app.userName}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {app.userEmail}
                  </Text>
                </Box>
                <StatusBadge status={app.applicationStatus} />
              </Flex>

              {/* Details Grid */}
              <SimpleGrid columns={2} gap={2} mb={3}>
                <DetailItem label="Phone" value={app.userPhone || "—"} />
                <DetailItem label="Van Size" value={app.vanSize || "—"} />
                <DetailItem label="Company" value={app.companyName || "—"} />
                <DetailItem
                  label="Coverage"
                  value={app.coverageRadius ? `${app.coverageRadius} km` : "—"}
                />
                <DetailItem
                  label="Applied"
                  value={new Date(app.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                />
                {app.reviewedAt && (
                  <DetailItem
                    label="Reviewed"
                    value={new Date(app.reviewedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  />
                )}
              </SimpleGrid>

              {/* Bio */}
              {app.bio && (
                <Box mb={3}>
                  <Text fontSize="xs" fontWeight="600" color="gray.500" mb={0.5}>
                    Bio
                  </Text>
                  <Text
                    fontSize="sm"
                    color="gray.700"
                    bg="gray.50"
                    p={2}
                    borderRadius="md"
                    lineClamp={3}
                  >
                    {app.bio}
                  </Text>
                </Box>
              )}

              {/* Rejection Reason */}
              {app.applicationStatus === "rejected" && app.rejectionReason && (
                <Box
                  mb={3}
                  bg="red.50"
                  borderRadius="md"
                  p={2}
                  borderLeftWidth="3px"
                  borderColor="red.400"
                >
                  <Text fontSize="xs" fontWeight="600" color="red.600" mb={0.5}>
                    Rejection Reason
                  </Text>
                  <Text fontSize="sm" color="red.700">
                    {app.rejectionReason}
                  </Text>
                </Box>
              )}

              {/* Reviewed By */}
              {app.reviewedBy && (
                <Text fontSize="xs" color="gray.400" mb={2}>
                  Reviewed by {app.reviewedBy}
                </Text>
              )}

              {/* Actions */}
              <ApplicationActions
                driverProfileId={app.id}
                currentStatus={app.applicationStatus}
              />
            </Box>
          ))}
        </SimpleGrid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Flex justify="center" mt={6} gap={2}>
          {page > 1 && (
            <a
              href={`/admin/applications?status=${statusFilter}&page=${page - 1}`}
            >
              <Box
                px={3}
                py={1}
                borderRadius="md"
                bg="white"
                borderWidth="1px"
                borderColor="gray.200"
                fontSize="sm"
                _hover={{ bg: "gray.100" }}
                cursor="pointer"
              >
                ← Prev
              </Box>
            </a>
          )}
          <Box px={3} py={1} fontSize="sm" color="gray.500">
            Page {page} of {totalPages}
          </Box>
          {page < totalPages && (
            <a
              href={`/admin/applications?status=${statusFilter}&page=${page + 1}`}
            >
              <Box
                px={3}
                py={1}
                borderRadius="md"
                bg="white"
                borderWidth="1px"
                borderColor="gray.200"
                fontSize="sm"
                _hover={{ bg: "gray.100" }}
                cursor="pointer"
              >
                Next →
              </Box>
            </a>
          )}
        </Flex>
      )}
    </Box>
  );
}

/* ── Helper Components ─────────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: "yellow.100", color: "yellow.800", label: "Pending Review" },
    approved: { bg: "green.100", color: "green.800", label: "Approved" },
    rejected: { bg: "red.100", color: "red.800", label: "Rejected" },
  };
  const s = styles[status] ?? styles.pending;
  return (
    <Flex
      display="inline-flex"
      px={2.5}
      py={0.5}
      borderRadius="full"
      bg={s.bg}
      color={s.color}
      fontSize="xs"
      fontWeight="600"
    >
      {s.label}
    </Flex>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text fontSize="xs" color="gray.500" fontWeight="500">
        {label}
      </Text>
      <Text fontSize="sm" color="gray.800" fontWeight="500">
        {value}
      </Text>
    </Box>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Box
      bg="white"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.100"
      p={3}
      textAlign="center"
    >
      <Text
        fontSize="2xl"
        fontWeight="800"
        color={`${color}.600`}
      >
        {value}
      </Text>
      <Text fontSize="xs" color="gray.500" fontWeight="500">
        {label}
      </Text>
    </Box>
  );
}
