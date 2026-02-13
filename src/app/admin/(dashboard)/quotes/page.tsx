// ─── VanJet · Admin Quotes Page ───────────────────────────────
import { db } from "@/lib/db";
import { quotes, jobs, users } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { Box, Flex, Text } from "@chakra-ui/react";
import { QuoteActions } from "@/components/admin/QuoteActions";

const LIMIT = 20;

interface Props {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function AdminQuotesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const statusFilter = params.status || "";
  const offset = (page - 1) * LIMIT;

  const conditions = statusFilter
    ? eq(quotes.status, statusFilter)
    : undefined;

  const [rows, [totalResult]] = await Promise.all([
    db
      .select({
        id: quotes.id,
        jobId: quotes.jobId,
        driverId: quotes.driverId,
        price: quotes.price,
        message: quotes.message,
        estimatedDuration: quotes.estimatedDuration,
        status: quotes.status,
        createdAt: quotes.createdAt,
      })
      .from(quotes)
      .where(conditions)
      .orderBy(desc(quotes.createdAt))
      .limit(LIMIT)
      .offset(offset),
    db.select({ value: count() }).from(quotes).where(conditions),
  ]);

  const total = totalResult.value;
  const totalPages = Math.ceil(total / LIMIT);

  const statuses = ["", "pending", "accepted", "rejected", "expired"];

  return (
    <Box>
      <Text fontSize="xl" fontWeight="700" mb={4} color="gray.800">
        Quotes ({total})
      </Text>

      {/* Status Filter */}
      <Flex gap={2} mb={4} flexWrap="wrap">
        {statuses.map((s) => {
          const isActive = statusFilter === s;
          const label = s === "" ? "All" : s;
          const href = s ? `/admin/quotes?status=${s}` : "/admin/quotes";
          return (
            <a key={s} href={href}>
              <Box
                px={3} py={1} borderRadius="full" fontSize="sm"
                fontWeight={isActive ? "600" : "400"}
                bg={isActive ? "blue.500" : "white"}
                color={isActive ? "white" : "gray.600"}
                borderWidth="1px" borderColor={isActive ? "blue.500" : "gray.200"}
                textTransform="capitalize"
                _hover={{ bg: isActive ? "blue.600" : "gray.100" }}
                cursor="pointer"
              >
                {label}
              </Box>
            </a>
          );
        })}
      </Flex>

      {/* Table */}
      <Box bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.100" overflowX="auto">
        <Box as="table" w="full" fontSize="sm">
          <Box as="thead" bg="gray.50">
            <Box as="tr">
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                Quote ID
              </Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                Job ID
              </Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                Driver
              </Box>
              <Box as="th" textAlign="right" px={4} py={3} fontWeight="600" color="gray.600">
                Price
              </Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                Duration
              </Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                Status
              </Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                Date
              </Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                Actions
              </Box>
            </Box>
          </Box>
          <Box as="tbody">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#a0aec0' }}>
                  No quotes found.
                </td>
              </tr>
            ) : (
              rows.map((q) => (
                <Box
                  as="tr" key={q.id}
                  borderTopWidth="1px" borderColor="gray.100" _hover={{ bg: "gray.50" }}
                >
                  <Box as="td" px={4} py={3} fontSize="xs" color="gray.500">
                    {q.id.slice(0, 8)}…
                  </Box>
                  <Box as="td" px={4} py={3} fontSize="xs" color="gray.500">
                    {q.jobId.slice(0, 8)}…
                  </Box>
                  <Box as="td" px={4} py={3} fontSize="xs" color="gray.500">
                    {q.driverId.slice(0, 8)}…
                  </Box>
                  <Box as="td" px={4} py={3} textAlign="right" fontWeight="500">
                    £{Number(q.price).toFixed(2)}
                  </Box>
                  <Box as="td" px={4} py={3}>
                    {q.estimatedDuration || "—"}
                  </Box>
                  <Box as="td" px={4} py={3}>
                    <QuoteBadge status={q.status} />
                  </Box>
                  <Box as="td" px={4} py={3} color="gray.500" whiteSpace="nowrap">
                    {new Date(q.createdAt).toLocaleDateString("en-GB")}
                  </Box>
                  <Box as="td" px={4} py={3}>
                    {q.status === "pending" && (
                      <QuoteActions quoteId={q.id} />
                    )}
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
            <a href={`/admin/quotes?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ""}`}>
              <Box px={3} py={1} borderRadius="md" bg="white" borderWidth="1px" borderColor="gray.200" fontSize="sm" _hover={{ bg: "gray.100" }} cursor="pointer">
                ← Prev
              </Box>
            </a>
          )}
          <Box px={3} py={1} fontSize="sm" color="gray.500">
            Page {page} of {totalPages}
          </Box>
          {page < totalPages && (
            <a href={`/admin/quotes?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ""}`}>
              <Box px={3} py={1} borderRadius="md" bg="white" borderWidth="1px" borderColor="gray.200" fontSize="sm" _hover={{ bg: "gray.100" }} cursor="pointer">
                Next →
              </Box>
            </a>
          )}
        </Flex>
      )}
    </Box>
  );
}

function QuoteBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    pending: { bg: "yellow.100", color: "yellow.800" },
    accepted: { bg: "green.100", color: "green.800" },
    rejected: { bg: "red.100", color: "red.800" },
    expired: { bg: "gray.100", color: "gray.600" },
  };
  const c = colors[status] ?? { bg: "gray.100", color: "gray.800" };
  return (
    <Flex
      display="inline-flex" px={2} py={0.5} borderRadius="full"
      bg={c.bg} color={c.color} fontSize="xs" fontWeight="600" textTransform="capitalize"
    >
      {status}
    </Flex>
  );
}
