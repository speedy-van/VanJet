"use client";

// ─── VanJet · Driver Dashboard Client Component ───────────────
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  Badge,
  Button,
} from "@chakra-ui/react";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface DriverProfile {
  companyName: string | null;
  vanSize: string | null;
  coverageRadius: number | null;
  verified: boolean;
  rating: string | null;
  totalJobs: number;
  bio: string | null;
}

interface DriverBooking {
  bookingId: string;
  status: string;
  finalPrice: string;
  trackingToken: string | null;
  createdAt: string;
  jobId: string;
  pickupAddress: string;
  deliveryAddress: string;
  moveDate: string;
  jobType: string;
}

interface Props {
  user: { name: string; email: string };
  profile: DriverProfile | null;
  bookings: DriverBooking[];
}

export function DriverDashboardClient({ user, profile, bookings }: Props) {
  return (
    <Box bg="gray.50" minH="100dvh" pb={8}>
      <Container maxW="container.lg" pt={6} px={{ base: 3, md: 6 }}>
        {/* Header */}
        <Flex
          justify="space-between"
          align="center"
          mb={6}
          flexWrap="wrap"
          gap={3}
        >
          <Box>
            <Heading size={{ base: "lg", md: "xl" }} color="#111827">
              Welcome, {user.name}
            </Heading>
            <Text fontSize="sm" color="#6B7280">
              {user.email}
            </Text>
          </Box>
          <Button
            size="sm"
            bg="white"
            color="#374151"
            borderWidth="1px"
            borderColor="#D1D5DB"
            fontWeight="600"
            _hover={{ bg: "#F9FAFB" }}
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign Out
          </Button>
        </Flex>

        {/* Profile Card */}
        {profile ? (
          <Box
            bg="white"
            borderRadius="xl"
            p={{ base: 5, md: 6 }}
            mb={6}
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <HStack justify="space-between" mb={3} flexWrap="wrap" gap={2}>
              <Text fontWeight="700" color="#111827" fontSize="md">
                Driver Profile
              </Text>
              <Badge
                colorPalette={profile.verified ? "green" : "orange"}
                variant="subtle"
                fontSize="xs"
              >
                {profile.verified ? "Verified" : "Pending Verification"}
              </Badge>
            </HStack>
            <Flex gap={6} flexWrap="wrap">
              <Box>
                <Text fontSize="xs" color="#9CA3AF" fontWeight="600">
                  Van Size
                </Text>
                <Text fontSize="sm" fontWeight="600" color="#374151">
                  {profile.vanSize ?? "—"}
                </Text>
              </Box>
              {profile.companyName && (
                <Box>
                  <Text fontSize="xs" color="#9CA3AF" fontWeight="600">
                    Company
                  </Text>
                  <Text fontSize="sm" fontWeight="600" color="#374151">
                    {profile.companyName}
                  </Text>
                </Box>
              )}
              <Box>
                <Text fontSize="xs" color="#9CA3AF" fontWeight="600">
                  Coverage
                </Text>
                <Text fontSize="sm" fontWeight="600" color="#374151">
                  {profile.coverageRadius ?? 50} km
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="#9CA3AF" fontWeight="600">
                  Rating
                </Text>
                <Text fontSize="sm" fontWeight="600" color="#374151">
                  {profile.rating ? `${profile.rating} ⭐` : "No reviews yet"}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="#9CA3AF" fontWeight="600">
                  Total Jobs
                </Text>
                <Text fontSize="sm" fontWeight="600" color="#374151">
                  {profile.totalJobs}
                </Text>
              </Box>
            </Flex>
          </Box>
        ) : (
          <Box
            bg="white"
            borderRadius="xl"
            p={6}
            mb={6}
            boxShadow="sm"
            textAlign="center"
          >
            <Text color="#6B7280">
              No driver profile found. Please contact support.
            </Text>
          </Box>
        )}

        {/* Stats Row */}
        <Flex gap={4} mb={6} flexWrap="wrap">
          {[
            {
              label: "Active Jobs",
              value: bookings.filter(
                (b) => b.status === "confirmed" || b.status === "in_progress"
              ).length,
              color: "#1D4ED8",
            },
            {
              label: "Completed",
              value: bookings.filter((b) => b.status === "completed").length,
              color: "#059669",
            },
            {
              label: "Total Earnings",
              value: `£${bookings
                .filter((b) => b.status === "completed")
                .reduce((sum, b) => sum + Number(b.finalPrice) * 0.85, 0)
                .toFixed(0)}`,
              color: "#111827",
            },
          ].map((stat) => (
            <Box
              key={stat.label}
              flex="1"
              minW="140px"
              bg="white"
              borderRadius="xl"
              p={4}
              boxShadow="sm"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Text fontSize="xs" color="#9CA3AF" fontWeight="600">
                {stat.label}
              </Text>
              <Text
                fontSize="2xl"
                fontWeight="800"
                color={stat.color}
                mt={1}
              >
                {stat.value}
              </Text>
            </Box>
          ))}
        </Flex>

        {/* Bookings List */}
        <Box>
          <Heading size="md" color="#111827" mb={4}>
            Your Bookings
          </Heading>

          {bookings.length === 0 ? (
            <Box
              bg="white"
              borderRadius="xl"
              p={8}
              textAlign="center"
              boxShadow="sm"
            >
              <Text fontSize="2xl" mb={2}>
                🚐
              </Text>
              <Text color="#6B7280">
                No bookings assigned yet. Jobs will appear here once you are
                verified and matched.
              </Text>
            </Box>
          ) : (
            <VStack gap={3} alignItems="stretch">
              {bookings.map((b) => (
                <Box
                  key={b.bookingId}
                  bg="white"
                  borderRadius="xl"
                  p={{ base: 4, md: 5 }}
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor="gray.200"
                  borderLeftWidth="4px"
                  borderLeftColor={
                    b.status === "completed"
                      ? "#059669"
                      : b.status === "in_progress"
                      ? "#F59E0B"
                      : b.status === "cancelled"
                      ? "#EF4444"
                      : "#1D4ED8"
                  }
                >
                  <Flex
                    justify="space-between"
                    align="flex-start"
                    flexWrap="wrap"
                    gap={2}
                    mb={2}
                  >
                    <Box>
                      <Text fontWeight="700" color="#1D4ED8" fontSize="xl">
                        £{Number(b.finalPrice).toFixed(2)}
                      </Text>
                      <Text fontSize="xs" color="#9CA3AF">
                        {new Date(b.moveDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        · {b.jobType.replace(/_/g, " ")}
                      </Text>
                    </Box>
                    <Badge
                      colorPalette={
                        b.status === "completed"
                          ? "green"
                          : b.status === "in_progress"
                          ? "yellow"
                          : b.status === "cancelled"
                          ? "red"
                          : "blue"
                      }
                      variant="subtle"
                      fontSize="xs"
                    >
                      {b.status.replace(/_/g, " ")}
                    </Badge>
                  </Flex>

                  <VStack gap={1} alignItems="stretch" mb={3}>
                    <HStack gap={2}>
                      <Box
                        w="8px"
                        h="8px"
                        borderRadius="full"
                        bg="#1D4ED8"
                        flexShrink={0}
                        mt="5px"
                      />
                      <Text fontSize="sm" color="#374151" lineClamp={1}>
                        {b.pickupAddress}
                      </Text>
                    </HStack>
                    <HStack gap={2}>
                      <Box
                        w="8px"
                        h="8px"
                        borderRadius="full"
                        bg="#059669"
                        flexShrink={0}
                        mt="5px"
                      />
                      <Text fontSize="sm" color="#374151" lineClamp={1}>
                        {b.deliveryAddress}
                      </Text>
                    </HStack>
                  </VStack>

                  {b.trackingToken &&
                    (b.status === "confirmed" ||
                      b.status === "in_progress") && (
                      <Link href={`/track/${b.trackingToken}`}>
                        <Button
                          size="sm"
                          bg="#059669"
                          color="white"
                          fontWeight="600"
                          borderRadius="6px"
                          _hover={{ bg: "#047857" }}
                        >
                          Live Tracking
                        </Button>
                      </Link>
                    )}
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </Container>
    </Box>
  );
}
