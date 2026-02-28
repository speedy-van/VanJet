// ─── VanJet · Admin Audit Log Page ─────────────────────────────
// Lists all admin actions (EDIT, REPRICE, CANCEL) with booking context.

import { db } from "@/lib/db";
import { adminAuditLogs, bookings } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { Box, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";

const LIMIT = 25;

interface Props {
  searchParams: Promise<{ page?: string; action?: string }>;
}

export default async function AdminAuditLogPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const actionFilter = params.action || "";
  const offset = (page - 1) * LIMIT;

  const actionCondition = actionFilter
    ? eq(adminAuditLogs.action, actionFilter.toUpperCase())
    : undefined;

  const [rows, [totalResult]] = await Promise.all([
    db
      .select({
        id: adminAuditLogs.id,
        createdAt: adminAuditLogs.createdAt,
        adminUserId: adminAuditLogs.adminUserId,
        bookingId: adminAuditLogs.bookingId,
        action: adminAuditLogs.action,
        diffJson: adminAuditLogs.diffJson,
        note: adminAuditLogs.note,
        orderNumber: bookings.orderNumber,
      })
      .from(adminAuditLogs)
      .innerJoin(bookings, eq(adminAuditLogs.bookingId, bookings.id))
      .where(actionCondition)
      .orderBy(desc(adminAuditLogs.createdAt))
      .limit(LIMIT)
      .offset(offset),
    db
      .select({ value: count() })
      .from(adminAuditLogs)
      .where(actionCondition),
  ]);

  const total = totalResult.value;
  const totalPages = Math.ceil(total / LIMIT);
  const actions = ["", "EDIT", "REPRICE", "CANCEL"];

  return (
    <Box>
      <Text fontSize="xl" fontWeight="700" mb={4} color="gray.800">
        Audit Log ({total})
      </Text>
      <Text fontSize="sm" color="gray.500" mb={4}>
        Full history of admin actions on bookings (edit, reprice, cancel).
      </Text>

      {/* Action filter */}
      <Flex gap={2} mb={4} flexWrap="wrap">
        {actions.map((a) => {
          const isActive = actionFilter === a;
          const label = a === "" ? "All" : a;
          const href = a
            ? `/admin/audit-log?action=${a}`
            : "/admin/audit-log";
          return (
            <a key={a || "all"} href={href}>
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
                {label}
              </Box>
            </a>
          );
        })}
      </Flex>

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
                Date
              </Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                Admin
              </Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                Action
              </Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                Booking
              </Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                Note
              </Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">
                Diff
              </Box>
            </Box>
          </Box>
          <Box as="tbody">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "#a0aec0",
                  }}
                >
                  No audit entries found.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <Box
                  as="tr"
                  key={r.id}
                  borderTopWidth="1px"
                  borderColor="gray.100"
                  _hover={{ bg: "gray.50" }}
                >
                  <Box as="td" px={4} py={3} color="gray.600" whiteSpace="nowrap">
                    {new Date(r.createdAt).toLocaleString("en-GB", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </Box>
                  <Box as="td" px={4} py={3} fontSize="xs" color="gray.600">
                    {r.adminUserId}
                  </Box>
                  <Box as="td" px={4} py={3}>
                    <ActionBadge action={r.action} />
                  </Box>
                  <Box as="td" px={4} py={3}>
                    <Link
                      href={`/admin/bookings/${r.bookingId}`}
                      style={{
                        color: "#1D4ED8",
                        fontWeight: 500,
                        fontSize: "12px",
                      }}
                    >
                      {r.orderNumber ?? r.bookingId.slice(0, 8)}… →
                    </Link>
                  </Box>
                  <Box as="td" px={4} py={3} maxW="200px" color="gray.600">
                    {r.note ? (
                      <Text fontSize="xs" title={r.note} style={{ overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px", whiteSpace: "nowrap" }}>
                        {r.note}
                      </Text>
                    ) : (
                      "—"
                    )}
                  </Box>
                  <Box as="td" px={4} py={3} maxW="180px">
                    {r.diffJson ? (
                      <Box
                        as="pre"
                        fontSize="10px"
                        bg="gray.50"
                        p={2}
                        borderRadius="md"
                        overflow="auto"
                        maxH="60px"
                        whiteSpace="pre-wrap"
                        wordBreak="break-all"
                      >
                        {r.diffJson.length > 120
                          ? `${r.diffJson.slice(0, 120)}…`
                          : r.diffJson}
                      </Box>
                    ) : (
                      "—"
                    )}
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Box>

      {totalPages > 1 && (
        <Flex justify="center" mt={4} gap={2}>
          {page > 1 && (
            <a
              href={`/admin/audit-log?page=${page - 1}${actionFilter ? `&action=${actionFilter}` : ""}`}
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
              href={`/admin/audit-log?page=${page + 1}${actionFilter ? `&action=${actionFilter}` : ""}`}
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

function ActionBadge({ action }: { action: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    EDIT: { bg: "blue.100", color: "blue.800" },
    REPRICE: { bg: "amber.100", color: "amber.800" },
    CANCEL: { bg: "red.100", color: "red.800" },
  };
  const c = colors[action] ?? { bg: "gray.100", color: "gray.800" };
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
    >
      {action}
    </Flex>
  );
}
