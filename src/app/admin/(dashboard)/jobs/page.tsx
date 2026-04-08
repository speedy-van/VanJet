// ─── VanJet · Admin Jobs Page ─────────────────────────────────
import { db } from "@/lib/db";
import { jobs, quotes } from "@/lib/db/schema";
import { eq, desc, count, sql, and, ilike } from "drizzle-orm";
import { Box, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import { SearchBar } from "./SearchBar";
import { JobsTable } from "./JobsTable";

const LIMIT = 20;

interface Props {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>;
}

export default async function AdminJobsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const statusFilter = params.status || "";
  const searchQuery = params.q || "";
  const offset = (page - 1) * LIMIT;

  // Build conditions array
  const conditionsArray = [];
  
  if (statusFilter) {
    conditionsArray.push(eq(jobs.status, statusFilter));
  }
  
  // Add search filter (search by reference number - case insensitive)
  // Note: UUID id column cannot use ILIKE, so only search reference number
  if (searchQuery) {
    conditionsArray.push(
      ilike(jobs.referenceNumber, `%${searchQuery}%`)
    );
  }
  
  const conditions = conditionsArray.length > 0 ? and(...conditionsArray) : undefined;

  const [jobRows, [totalResult]] = await Promise.all([
    db
      .select({
        id: jobs.id,
        referenceNumber: jobs.referenceNumber,
        pickupAddress: jobs.pickupAddress,
        deliveryAddress: jobs.deliveryAddress,
        status: jobs.status,
        jobType: jobs.jobType,
        estimatedPrice: jobs.estimatedPrice,
        moveDate: jobs.moveDate,
        contactName: jobs.contactName,
        createdAt: jobs.createdAt,
        quoteCount: sql<number>`(SELECT COUNT(*) FROM ${quotes} WHERE ${quotes.jobId} = ${jobs.id})`.as("quote_count"),
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

      {/* Search Bar */}
      <Box mb={4}>
        <SearchBar currentQuery={searchQuery} />
      </Box>

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
                bg={isActive ? "purple.500" : "white"}
                color={isActive ? "white" : "gray.600"}
                borderWidth="1px"
                borderColor={isActive ? "purple.500" : "gray.200"}
                textTransform="capitalize"
                _hover={{ bg: isActive ? "purple.600" : "gray.100" }}
                transition="all 0.15s"
                cursor="pointer"
              >
                {label}
              </Box>
            </Link>
          );
        })}
      </Flex>

      {/* Jobs Table with Selection */}
      <JobsTable
        jobs={jobRows.map((job) => ({
          id: job.id,
          referenceNumber: job.referenceNumber,
          pickupAddress: job.pickupAddress,
          deliveryAddress: job.deliveryAddress,
          status: job.status,
          jobType: job.jobType,
          estimatedPrice: job.estimatedPrice,
          moveDate: job.moveDate,
          contactName: job.contactName,
          quoteCount: job.quoteCount,
        }))}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Flex justify="center" mt={4} gap={2}>
          {page > 1 && (
            <Link
              href={`/admin/jobs?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ""}${searchQuery ? `&q=${searchQuery}` : ""}`}
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
              href={`/admin/jobs?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ""}${searchQuery ? `&q=${searchQuery}` : ""}`}
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
