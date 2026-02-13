// ─── VanJet · Admin Jobs Page ─────────────────────────────────
import { db } from "@/lib/db";
import { jobs, users } from "@/lib/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { Box, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";

const LIMIT = 20;

interface Props {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function AdminJobsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const statusFilter = params.status || "";
  const offset = (page - 1) * LIMIT;

  // Build conditions
  const conditions = statusFilter ? eq(jobs.status, statusFilter) : undefined;

  const [jobRows, [totalResult]] = await Promise.all([
    db
      .select({
        id: jobs.id,
        pickupAddress: jobs.pickupAddress,
        deliveryAddress: jobs.deliveryAddress,
        status: jobs.status,
        jobType: jobs.jobType,
        estimatedPrice: jobs.estimatedPrice,
        moveDate: jobs.moveDate,
        contactName: jobs.contactName,
        createdAt: jobs.createdAt,
      })
      .from(jobs)
      .where(conditions)
      .orderBy(desc(jobs.createdAt))
      .limit(LIMIT)
      .offset(offset),
    db
      .select({ value: count() })
      .from(jobs)
      .where(conditions),
  ]);

  const total = totalResult.value;
  const totalPages = Math.ceil(total / LIMIT);

  const statuses = ["", "pending", "quoted", "accepted", "in_progress", "completed", "cancelled"];

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={2}>
        <Text fontSize="xl" fontWeight="700" color="gray.800">
          Jobs ({total})
        </Text>
      </Flex>

      {/* Status Filter Tabs */}
      <Flex gap={2} mb={4} flexWrap="wrap">
        {statuses.map((s) => {
          const isActive = statusFilter === s;
          const label = s === "" ? "All" : s.replace("_", " ");
          const href = s ? `/admin/jobs?status=${s}` : "/admin/jobs";
          return (
            <Link key={s} href={href}>
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
                textTransform="capitalize"
                _hover={{ bg: isActive ? "blue.600" : "gray.100" }}
                transition="all 0.15s"
                cursor="pointer"
              >
                {label}
              </Box>
            </Link>
          );
        })}
      </Flex>

      {/* Table */}
      <Box bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.100" overflowX="auto">
        <Box as="table" w="full" fontSize="sm">
          <Box as="thead" bg="gray.50">
            <Box as="tr">
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                Contact
              </Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                Type
              </Box>
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
                Price
              </Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                Move Date
              </Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                Actions
              </Box>
            </Box>
          </Box>
          <Box as="tbody">
            {jobRows.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#a0aec0' }}>
                  No jobs found.
                </td>
              </tr>
            ) : (
              jobRows.map((job) => (
                <Box
                  as="tr"
                  key={job.id}
                  borderTopWidth="1px"
                  borderColor="gray.100"
                  _hover={{ bg: "gray.50" }}
                >
                  <Box as="td" px={4} py={3} fontWeight="500">
                    {job.contactName || "—"}
                  </Box>
                  <Box as="td" px={4} py={3} textTransform="capitalize">
                    {job.jobType.replace("_", " ")}
                  </Box>
                  <Box as="td" px={4} py={3} maxW="180px" truncate>
                    {job.pickupAddress}
                  </Box>
                  <Box as="td" px={4} py={3} maxW="180px" truncate>
                    {job.deliveryAddress}
                  </Box>
                  <Box as="td" px={4} py={3}>
                    <StatusBadge status={job.status} />
                  </Box>
                  <Box as="td" px={4} py={3} textAlign="right" fontWeight="500">
                    {job.estimatedPrice ? `£${Number(job.estimatedPrice).toFixed(2)}` : "—"}
                  </Box>
                  <Box as="td" px={4} py={3} color="gray.500" whiteSpace="nowrap">
                    {new Date(job.moveDate).toLocaleDateString("en-GB")}
                  </Box>
                  <Box as="td" px={4} py={3}>
                    <Link href={`/admin/jobs/${job.id}`}>
                      <Text
                        color="blue.500"
                        fontWeight="500"
                        fontSize="sm"
                        _hover={{ textDecoration: "underline" }}
                      >
                        View
                      </Text>
                    </Link>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Flex justify="center" mt={4} gap={2}>
          {page > 1 && (
            <Link
              href={`/admin/jobs?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
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
            </Link>
          )}
          <Box px={3} py={1} fontSize="sm" color="gray.500">
            Page {page} of {totalPages}
          </Box>
          {page < totalPages && (
            <Link
              href={`/admin/jobs?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
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
            </Link>
          )}
        </Flex>
      )}
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
