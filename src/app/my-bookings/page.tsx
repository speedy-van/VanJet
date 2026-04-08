// ─── VanJet · My Bookings Page (Customer) ──────────────────────
// Server component. Redirects to /login if not signed in.

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getCustomerJobsAndBookings } from "@/lib/customer/queries";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Flex,
} from "@chakra-ui/react";
import Link from "next/link";

export const metadata = {
  title: "My Bookings — VanJet",
  description: "View and track your removal and delivery bookings.",
};

export default async function MyBookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { jobs: jobRows, bookingsByJob } = await getCustomerJobsAndBookings(
    session.user.id
  );

  return (
    <Box bg="gray.50" minH="100dvh" py={{ base: 6, md: 10 }} px={{ base: 4, md: 6 }}>
      <Container maxW="720px">
        <Flex
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          direction={{ base: "column", sm: "row" }}
          gap={4}
          mb={6}
        >
          <Box>
            <Heading
              as="h1"
              size={{ base: "lg", md: "xl" }}
              color="#111827"
              fontWeight="800"
            >
              My Bookings
            </Heading>
            <Text color="#6B7280" fontSize="sm" mt={1}>
              {session.user.email}
            </Text>
          </Box>
          <Link href="/book">
            <Box
              as="span"
              display="inline-block"
              px={4}
              py={2}
              borderRadius="8px"
              bg="#1D4ED8"
              color="white"
              fontWeight="600"
              fontSize="sm"
              _hover={{ bg: "#1840B8" }}
            >
              Book a move
            </Box>
          </Link>
        </Flex>

        {jobRows.length === 0 ? (
          <Box
            bg="white"
            borderRadius="xl"
            p={{ base: 8, md: 12 }}
            textAlign="center"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Text color="#6B7280" mb={4}>
              You don&apos;t have any bookings yet.
            </Text>
            <Link href="/book">
              <Box
                as="span"
                display="inline-block"
                px={5}
                py={2}
                borderRadius="8px"
                bg="#F59E0B"
                color="#111827"
                fontWeight="700"
                fontSize="sm"
              >
                Get your first quote
              </Box>
            </Link>
          </Box>
        ) : (
          <VStack gap={4} align="stretch">
            {jobRows.map((job) => {
              const jobBookings = bookingsByJob[job.id] ?? [];
              const moveDateStr =
                job.moveDate instanceof Date
                  ? job.moveDate.toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : String(job.moveDate);

              return (
                <Box
                  key={job.id}
                  bg="white"
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor="gray.200"
                  overflow="hidden"
                >
                  <Box p={{ base: 4, md: 5 }}>
                    <Flex
                      justify="space-between"
                      align={{ base: "flex-start", sm: "center" }}
                      direction={{ base: "column", sm: "row" }}
                      gap={2}
                    >
                      <VStack align="stretch" gap={0}>
                        <Text fontWeight="700" color="#111827" fontSize="sm">
                          Ref: {job.referenceNumber}
                        </Text>
                        <Text color="#6B7280" fontSize="xs" lineClamp={1}>
                          {job.pickupAddress} → {job.deliveryAddress}
                        </Text>
                      </VStack>
                      <Badge
                        colorPalette={
                          job.status === "completed"
                            ? "green"
                            : job.status === "cancelled"
                              ? "red"
                              : "blue"
                        }
                        fontSize="xs"
                        textTransform="capitalize"
                      >
                        {job.status}
                      </Badge>
                    </Flex>
                    <Text color="#6B7280" fontSize="xs" mt={2}>
                      Move date: {moveDateStr}
                    </Text>

                    {jobBookings.length > 0 && (
                      <VStack align="stretch" gap={2} mt={4}>
                        {jobBookings.map((b) => (
                          <Flex
                            key={b.id}
                            justify="space-between"
                            align="center"
                            flexWrap="wrap"
                            gap={2}
                            py={2}
                            borderTopWidth="1px"
                            borderColor="gray.100"
                          >
                            <HStack gap={2} flexWrap="wrap">
                              <Text fontSize="sm" fontWeight="600">
                                {b.orderNumber ?? "—"}
                              </Text>
                              <Badge
                                colorPalette={
                                  b.paymentStatus === "paid"
                                    ? "green"
                                    : "yellow"
                                }
                                fontSize="10px"
                              >
                                {b.paymentStatus}
                              </Badge>
                              <Text fontSize="xs" color="gray.500">
                                £{Number(b.finalPrice).toFixed(2)}
                              </Text>
                            </HStack>
                            {b.trackingToken && (
                              <Link href={`/track/${b.trackingToken}`}>
                                <Text
                                  fontSize="sm"
                                  color="#1D4ED8"
                                  fontWeight="600"
                                >
                                  Track →
                                </Text>
                              </Link>
                            )}
                            {!b.trackingToken && job.status === "accepted" && (
                              <Link href={`/job/${job.id}/quotes`}>
                                <Text
                                  fontSize="sm"
                                  color="#1D4ED8"
                                  fontWeight="600"
                                >
                                  Pay / View quotes →
                                </Text>
                              </Link>
                            )}
                          </Flex>
                        ))}
                      </VStack>
                    )}

                    {jobBookings.length === 0 && (
                      <Link href={`/job/${job.id}/quotes`}>
                        <Text
                          fontSize="sm"
                          color="#1D4ED8"
                          fontWeight="600"
                          mt={3}
                        >
                          View quotes & pay →
                        </Text>
                      </Link>
                    )}
                  </Box>
                </Box>
              );
            })}
          </VStack>
        )}

        <Box mt={8} textAlign="center">
          <Link href="/">
            <Text fontSize="sm" color="#6B7280">
              ← Back to home
            </Text>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
