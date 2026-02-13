// ─── VanJet · Admin Users Page ────────────────────────────────
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { Box, Flex, Text } from "@chakra-ui/react";

const LIMIT = 20;

interface Props {
  searchParams: Promise<{ page?: string; role?: string }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const roleFilter = params.role || "";
  const offset = (page - 1) * LIMIT;

  const conditions = roleFilter ? eq(users.role, roleFilter) : undefined;

  const [rows, [totalResult]] = await Promise.all([
    db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        role: users.role,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(conditions)
      .orderBy(desc(users.createdAt))
      .limit(LIMIT)
      .offset(offset),
    db.select({ value: count() }).from(users).where(conditions),
  ]);

  const total = totalResult.value;
  const totalPages = Math.ceil(total / LIMIT);

  const roles = ["", "customer", "driver", "admin"];

  return (
    <Box>
      <Text fontSize="xl" fontWeight="700" mb={4} color="gray.800">
        Users ({total})
      </Text>

      {/* Role Filter */}
      <Flex gap={2} mb={4} flexWrap="wrap">
        {roles.map((r) => {
          const isActive = roleFilter === r;
          const label = r === "" ? "All" : r;
          const href = r ? `/admin/users?role=${r}` : "/admin/users";
          return (
            <a key={r} href={href}>
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
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">Name</Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">Email</Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">Phone</Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">Role</Box>
              <Box as="th" textAlign="center" px={4} py={3} fontWeight="600" color="gray.600">Verified</Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">Joined</Box>
            </Box>
          </Box>
          <Box as="tbody">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#a0aec0' }}>
                  No users found.
                </td>
              </tr>
            ) : (
              rows.map((u) => (
                <Box
                  as="tr" key={u.id}
                  borderTopWidth="1px" borderColor="gray.100" _hover={{ bg: "gray.50" }}
                >
                  <Box as="td" px={4} py={3} fontWeight="500">{u.name}</Box>
                  <Box as="td" px={4} py={3} color="gray.500">{u.email}</Box>
                  <Box as="td" px={4} py={3}>{u.phone || "—"}</Box>
                  <Box as="td" px={4} py={3}>
                    <RoleBadge role={u.role} />
                  </Box>
                  <Box as="td" px={4} py={3} textAlign="center">
                    {u.emailVerified ? "✓" : "—"}
                  </Box>
                  <Box as="td" px={4} py={3} color="gray.500" whiteSpace="nowrap">
                    {new Date(u.createdAt).toLocaleDateString("en-GB")}
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
            <a href={`/admin/users?page=${page - 1}${roleFilter ? `&role=${roleFilter}` : ""}`}>
              <Box px={3} py={1} borderRadius="md" bg="white" borderWidth="1px" borderColor="gray.200" fontSize="sm" _hover={{ bg: "gray.100" }} cursor="pointer">
                ← Prev
              </Box>
            </a>
          )}
          <Box px={3} py={1} fontSize="sm" color="gray.500">
            Page {page} of {totalPages}
          </Box>
          {page < totalPages && (
            <a href={`/admin/users?page=${page + 1}${roleFilter ? `&role=${roleFilter}` : ""}`}>
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

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    admin: { bg: "red.100", color: "red.800" },
    driver: { bg: "purple.100", color: "purple.800" },
    customer: { bg: "blue.100", color: "blue.800" },
  };
  const c = colors[role] ?? { bg: "gray.100", color: "gray.800" };
  return (
    <Flex
      display="inline-flex" px={2} py={0.5} borderRadius="full"
      bg={c.bg} color={c.color} fontSize="xs" fontWeight="600" textTransform="capitalize"
    >
      {role}
    </Flex>
  );
}
