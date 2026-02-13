// ─── VanJet · Admin Bookings Page ─────────────────────────────
import { db } from "@/lib/db";
import { bookings, jobs, users } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { Box, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";

const LIMIT = 20;

interface Props {
  searchParams: Promise<{ page?: string; payment?: string }>;
}

export default async function AdminBookingsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const paymentFilter = params.payment || "";
  const offset = (page - 1) * LIMIT;

  const conditions = paymentFilter
    ? eq(bookings.paymentStatus, paymentFilter)
    : undefined;

  const [rows, [totalResult]] = await Promise.all([
    db
      .select({
        id: bookings.id,
        jobId: bookings.jobId,
        finalPrice: bookings.finalPrice,
        paymentStatus: bookings.paymentStatus,
        status: bookings.status,
        stripePaymentIntentId: bookings.stripePaymentIntentId,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .where(conditions)
      .orderBy(desc(bookings.createdAt))
      .limit(LIMIT)
      .offset(offset),
    db.select({ value: count() }).from(bookings).where(conditions),
  ]);

  const total = totalResult.value;
  const totalPages = Math.ceil(total / LIMIT);

  const paymentStatuses = ["", "unpaid", "paid", "refunded"];

  return (
    <Box>
      <Text fontSize="xl" fontWeight="700" mb={4} color="gray.800">
        Bookings ({total})
      </Text>

      {/* Payment Filter */}
      <Flex gap={2} mb={4} flexWrap="wrap">
        {paymentStatuses.map((s) => {
          const isActive = paymentFilter === s;
          const label = s === "" ? "All" : s;
          const href = s
            ? `/admin/bookings?payment=${s}`
            : "/admin/bookings";
          return (
            <a key={s} href={href}>
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
                Booking ID
              </Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                Job ID
              </Box>
              <Box as="th" textAlign="right" px={4} py={3} fontWeight="600" color="gray.600">
                Final Price
              </Box>
              <Box as="th" textAlign="right" px={4} py={3} fontWeight="600" color="gray.600">
                Platform Fee (15%)
              </Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                Payment
              </Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                Status
              </Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                Date
              </Box>
              <Box as="th" px={4} py={3} fontWeight="600" color="gray.600">
              </Box>
            </Box>
          </Box>
          <Box as="tbody">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#a0aec0' }}>
                  No bookings found.
                </td>
              </tr>
            ) : (
              rows.map((b) => {
                const price = Number(b.finalPrice);
                const fee = price * 0.15;
                return (
                  <Box
                    as="tr"
                    key={b.id}
                    borderTopWidth="1px"
                    borderColor="gray.100"
                    _hover={{ bg: "gray.50" }}
                  >
                    <Box as="td" px={4} py={3} fontSize="xs">
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        style={{ color: '#1D4ED8', fontWeight: 500 }}
                      >
                        {b.id.slice(0, 8)}…
                      </Link>
                    </Box>
                    <Box as="td" px={4} py={3} fontSize="xs" color="gray.500">
                      {b.jobId.slice(0, 8)}…
                    </Box>
                    <Box as="td" px={4} py={3} textAlign="right" fontWeight="500">
                      £{price.toFixed(2)}
                    </Box>
                    <Box as="td" px={4} py={3} textAlign="right" color="green.600" fontWeight="500">
                      £{fee.toFixed(2)}
                    </Box>
                    <Box as="td" px={4} py={3}>
                      <PaymentBadge status={b.paymentStatus} />
                    </Box>
                    <Box as="td" px={4} py={3} textTransform="capitalize">
                      {b.status}
                    </Box>
                    <Box as="td" px={4} py={3} color="gray.500" whiteSpace="nowrap">
                      {new Date(b.createdAt).toLocaleDateString("en-GB")}
                    </Box>
                    <Box as="td" px={4} py={3}>
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        style={{
                          fontSize: '12px',
                          color: '#1D4ED8',
                          fontWeight: 500,
                        }}
                      >
                        View →
                      </Link>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Flex justify="center" mt={4} gap={2}>
          {page > 1 && (
            <a
              href={`/admin/bookings?page=${page - 1}${paymentFilter ? `&payment=${paymentFilter}` : ""}`}
            >
              <Box
                px={3} py={1} borderRadius="md" bg="white"
                borderWidth="1px" borderColor="gray.200" fontSize="sm"
                _hover={{ bg: "gray.100" }} cursor="pointer"
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
              href={`/admin/bookings?page=${page + 1}${paymentFilter ? `&payment=${paymentFilter}` : ""}`}
            >
              <Box
                px={3} py={1} borderRadius="md" bg="white"
                borderWidth="1px" borderColor="gray.200" fontSize="sm"
                _hover={{ bg: "gray.100" }} cursor="pointer"
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

function PaymentBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    unpaid: { bg: "yellow.100", color: "yellow.800" },
    paid: { bg: "green.100", color: "green.800" },
    refunded: { bg: "red.100", color: "red.800" },
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
