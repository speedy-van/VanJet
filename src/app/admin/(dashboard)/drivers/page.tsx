// ─── VanJet · Admin Drivers Page ──────────────────────────────
import { db } from "@/lib/db";
import { driverProfiles, users } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { Box, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import { DriverVerifyToggle } from "@/components/admin/DriverVerifyToggle";

const LIMIT = 20;

interface Props {
  searchParams: Promise<{ page?: string; verified?: string }>;
}

export default async function AdminDriversPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const verifiedFilter = params.verified;
  const offset = (page - 1) * LIMIT;

  const conditions =
    verifiedFilter === "true"
      ? eq(driverProfiles.verified, true)
      : verifiedFilter === "false"
        ? eq(driverProfiles.verified, false)
        : undefined;

  const [rows, [totalResult]] = await Promise.all([
    db
      .select({
        id: driverProfiles.id,
        userId: driverProfiles.userId,
        companyName: driverProfiles.companyName,
        vanSize: driverProfiles.vanSize,
        maxWeightKg: driverProfiles.maxWeightKg,
        coverageRadius: driverProfiles.coverageRadius,
        rating: driverProfiles.rating,
        totalJobs: driverProfiles.totalJobs,
        verified: driverProfiles.verified,
        stripeOnboarded: driverProfiles.stripeOnboarded,
        createdAt: driverProfiles.createdAt,
        userName: users.name,
        userEmail: users.email,
        userPhone: users.phone,
      })
      .from(driverProfiles)
      .innerJoin(users, eq(driverProfiles.userId, users.id))
      .where(conditions)
      .orderBy(desc(driverProfiles.createdAt))
      .limit(LIMIT)
      .offset(offset),
    db.select({ value: count() }).from(driverProfiles).where(conditions),
  ]);

  const total = totalResult.value;
  const totalPages = Math.ceil(total / LIMIT);

  const filters = [
    { label: "All", value: "" },
    { label: "Verified", value: "true" },
    { label: "Unverified", value: "false" },
  ];

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={2}>
        <Text fontSize="xl" fontWeight="700" color="gray.800">
          Drivers ({total})
        </Text>
        <Link href="/admin/applications">
          <Box
            px={3} py={1} borderRadius="md" bg="blue.500" color="white"
            fontSize="sm" fontWeight="600" _hover={{ bg: "blue.600" }}
            cursor="pointer"
          >
            📝 Driver Applications
          </Box>
        </Link>
      </Flex>

      {/* Filter */}
      <Flex gap={2} mb={4} flexWrap="wrap">
        {filters.map((f) => {
          const isActive = (verifiedFilter ?? "") === f.value;
          const href = f.value
            ? `/admin/drivers?verified=${f.value}`
            : "/admin/drivers";
          return (
            <a key={f.value} href={href}>
              <Box
                px={3} py={1} borderRadius="full" fontSize="sm"
                fontWeight={isActive ? "600" : "400"}
                bg={isActive ? "blue.500" : "white"}
                color={isActive ? "white" : "gray.600"}
                borderWidth="1px" borderColor={isActive ? "blue.500" : "gray.200"}
                _hover={{ bg: isActive ? "blue.600" : "gray.100" }}
                cursor="pointer"
              >
                {f.label}
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
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">Company</Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">Van</Box>
              <Box as="th" textAlign="center" px={4} py={3} fontWeight="600" color="gray.600">Rating</Box>
              <Box as="th" textAlign="center" px={4} py={3} fontWeight="600" color="gray.600">Jobs</Box>
              <Box as="th" textAlign="center" px={4} py={3} fontWeight="600" color="gray.600">Stripe</Box>
              <Box as="th" textAlign="center" px={4} py={3} fontWeight="600" color="gray.600">Verified</Box>
              <Box as="th" textAlign="left" px={4} py={3} fontWeight="600" color="gray.600">Action</Box>
            </Box>
          </Box>
          <Box as="tbody">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: '#a0aec0' }}>
                  No drivers found.
                </td>
              </tr>
            ) : (
              rows.map((d) => (
                <Box
                  as="tr" key={d.id}
                  borderTopWidth="1px" borderColor="gray.100" _hover={{ bg: "gray.50" }}
                >
                  <Box as="td" px={4} py={3} fontWeight="500">{d.userName}</Box>
                  <Box as="td" px={4} py={3} color="gray.500" fontSize="xs">{d.userEmail}</Box>
                  <Box as="td" px={4} py={3}>{d.companyName || "—"}</Box>
                  <Box as="td" px={4} py={3}>{d.vanSize || "—"}</Box>
                  <Box as="td" px={4} py={3} textAlign="center">
                    {d.rating ? `${Number(d.rating).toFixed(1)} ⭐` : "—"}
                  </Box>
                  <Box as="td" px={4} py={3} textAlign="center">{d.totalJobs}</Box>
                  <Box as="td" px={4} py={3} textAlign="center">
                    <Flex display="inline-flex" px={2} py={0.5} borderRadius="full"
                      bg={d.stripeOnboarded ? "green.100" : "gray.100"}
                      color={d.stripeOnboarded ? "green.800" : "gray.600"}
                      fontSize="xs" fontWeight="600"
                    >
                      {d.stripeOnboarded ? "Yes" : "No"}
                    </Flex>
                  </Box>
                  <Box as="td" px={4} py={3} textAlign="center">
                    <Flex display="inline-flex" px={2} py={0.5} borderRadius="full"
                      bg={d.verified ? "green.100" : "yellow.100"}
                      color={d.verified ? "green.800" : "yellow.800"}
                      fontSize="xs" fontWeight="600"
                    >
                      {d.verified ? "Verified" : "Pending"}
                    </Flex>
                  </Box>
                  <Box as="td" px={4} py={3}>
                    <DriverVerifyToggle
                      driverProfileId={d.id}
                      verified={d.verified}
                    />
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
            <a href={`/admin/drivers?page=${page - 1}${verifiedFilter ? `&verified=${verifiedFilter}` : ""}`}>
              <Box px={3} py={1} borderRadius="md" bg="white" borderWidth="1px" borderColor="gray.200" fontSize="sm" _hover={{ bg: "gray.100" }} cursor="pointer">
                ← Prev
              </Box>
            </a>
          )}
          <Box px={3} py={1} fontSize="sm" color="gray.500">
            Page {page} of {totalPages}
          </Box>
          {page < totalPages && (
            <a href={`/admin/drivers?page=${page + 1}${verifiedFilter ? `&verified=${verifiedFilter}` : ""}`}>
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
