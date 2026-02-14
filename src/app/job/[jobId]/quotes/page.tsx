"use client";

import { useState, useEffect, use } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Flex,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import { formatGBP } from "@/lib/money/format";
import Link from "next/link";

interface QuoteDriver {
  id: string;
  name: string;
  companyName: string | null;
  vanSize: string | null;
  rating: number;
  totalJobs: number;
  verified: boolean;
  stripeOnboarded: boolean;
}

interface Quote {
  id: string;
  price: number;
  message: string | null;
  estimatedDuration: string | null;
  status: string;
  expiresAt: string | null;
  createdAt: string;
  driver: QuoteDriver;
}

interface JobSummary {
  id: string;
  jobType: string;
  status: string;
  pickupAddress: string;
  deliveryAddress: string;
  moveDate: string;
  estimatedPrice: number | null;
  distanceMiles: number | null;
}

export default function JobQuotesPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const [job, setJob] = useState<JobSummary | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState<string | null>(null);
  const [acceptResult, setAcceptResult] = useState<{
    bookingId?: string;
    quoteId?: string;
    price?: number;
    error?: string;
  } | null>(null);

  useEffect(() => {
    fetchQuotes();
  }, [jobId]);

  async function fetchQuotes() {
    try {
      setLoading(true);
      const res = await fetch(`/api/jobs/${jobId}/quotes`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load quotes.");
      }
      const data = await res.json();
      setJob(data.job);
      setQuotes(data.quotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptQuote(quoteId: string) {
    setAccepting(quoteId);
    setAcceptResult(null);

    try {
      const res = await fetch(`/api/quotes/${quoteId}/accept`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to accept quote.");

      setAcceptResult({
        bookingId: data.bookingId,
        quoteId: data.quoteId,
        price: data.price,
      });

      // Refresh quotes
      fetchQuotes();
    } catch (err) {
      setAcceptResult({
        error: err instanceof Error ? err.message : "Failed to accept.",
      });
    } finally {
      setAccepting(null);
    }
  }

  if (loading) {
    return (
      <Flex minH="60vh" align="center" justify="center">
        <Spinner size="lg" color="blue.500" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box maxW="600px" mx="auto" p={6}>
        <Box bg="red.50" p={4} borderRadius="lg">
          <Text color="red.600" fontWeight="600">{error}</Text>
        </Box>
      </Box>
    );
  }

  const hasAcceptedQuote = quotes.some((q) => q.status === "accepted");

  return (
    <Box
      maxW="800px"
      mx="auto"
      px={{ base: 4, md: 6 }}
      py={{ base: 6, md: 10 }}
    >
      <VStack gap={6} align="stretch">
        {/* Job Summary */}
        {job && (
          <Box
            bg="white"
            borderRadius="xl"
            shadow="sm"
            p={{ base: 4, md: 6 }}
            border="1px solid"
            borderColor="gray.100"
          >
            <HStack justify="space-between" mb={3} flexWrap="wrap">
              <Text fontSize="lg" fontWeight="800" color="gray.800">
                Your Job
              </Text>
              <Badge
                colorPalette={
                  job.status === "accepted"
                    ? "green"
                    : job.status === "quoted"
                      ? "blue"
                      : "gray"
                }
                px={2}
                py={0.5}
                borderRadius="md"
                fontSize="xs"
              >
                {job.status}
              </Badge>
            </HStack>
            <VStack gap={2} align="stretch" fontSize="sm" color="gray.600">
              <HStack gap={2}>
                <Text fontWeight="600" minW="50px">From:</Text>
                <Text>{job.pickupAddress}</Text>
              </HStack>
              <HStack gap={2}>
                <Text fontWeight="600" minW="50px">To:</Text>
                <Text>{job.deliveryAddress}</Text>
              </HStack>
              <HStack gap={4}>
                <Text>
                  📅{" "}
                  {new Date(job.moveDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
                {job.distanceMiles && <Text>📏 {job.distanceMiles} mi</Text>}
                {job.estimatedPrice && (
                  <Text fontWeight="700" color="#1D4ED8">
                    Est. {formatGBP(job.estimatedPrice)}
                  </Text>
                )}
              </HStack>
            </VStack>
          </Box>
        )}

        {/* Accept result banner */}
        {acceptResult && !acceptResult.error && (
          <Box bg="green.50" p={4} borderRadius="lg" border="1px solid" borderColor="green.200">
            <Text fontWeight="700" color="green.700">
              ✓ Quote accepted — {formatGBP(acceptResult.price ?? 0)}
            </Text>
            <Text fontSize="sm" color="green.600" mt={1}>
              Proceed to payment to confirm your booking.
            </Text>
            <Link
              href={`/job/${jobId}/pay?bookingId=${acceptResult.bookingId}&quoteId=${acceptResult.quoteId}`}
            >
              <Button
                mt={3}
                bg="#1D4ED8"
                color="white"
                fontWeight="700"
                _hover={{ bg: "#1840B8" }}
              >
                Pay Now
              </Button>
            </Link>
          </Box>
        )}
        {acceptResult?.error && (
          <Box bg="red.50" p={4} borderRadius="lg">
            <Text color="red.600" fontWeight="600">{acceptResult.error}</Text>
          </Box>
        )}

        {/* Quotes */}
        <Text fontSize="xl" fontWeight="800" color="gray.800">
          Driver Quotes ({quotes.length})
        </Text>

        {quotes.length === 0 && (
          <Box
            bg="white"
            borderRadius="xl"
            shadow="sm"
            p={8}
            textAlign="center"
          >
            <Text fontSize="lg" color="gray.500">
              No quotes yet.
            </Text>
            <Text fontSize="sm" color="gray.400" mt={2}>
              Drivers in your area will start sending quotes shortly.
            </Text>
          </Box>
        )}

        {quotes.map((q) => (
          <Box
            key={q.id}
            bg="white"
            borderRadius="xl"
            shadow="sm"
            border="1px solid"
            borderColor={
              q.status === "accepted"
                ? "green.300"
                : q.status === "rejected"
                  ? "gray.200"
                  : "gray.100"
            }
            p={{ base: 4, md: 6 }}
            opacity={q.status === "rejected" ? 0.5 : 1}
          >
            <VStack gap={3} align="stretch">
              <HStack justify="space-between" flexWrap="wrap">
                <HStack gap={2}>
                  <Flex
                    w="40px"
                    h="40px"
                    borderRadius="full"
                    bg="blue.50"
                    color="#1D4ED8"
                    align="center"
                    justify="center"
                    fontWeight="800"
                    fontSize="sm"
                  >
                    {q.driver.name.charAt(0).toUpperCase()}
                  </Flex>
                  <Box>
                    <Text fontWeight="700" fontSize="sm" color="gray.800">
                      {q.driver.name}
                    </Text>
                    {q.driver.companyName && (
                      <Text fontSize="xs" color="gray.500">
                        {q.driver.companyName}
                      </Text>
                    )}
                  </Box>
                </HStack>
                <Text fontSize="xl" fontWeight="800" color="#1D4ED8">
                  {formatGBP(q.price)}
                </Text>
              </HStack>

              {/* Driver details */}
              <HStack gap={3} flexWrap="wrap" fontSize="xs" color="gray.500">
                {q.driver.vanSize && (
                  <Badge colorPalette="gray" px={2} py={0.5} borderRadius="md">
                    {q.driver.vanSize}
                  </Badge>
                )}
                <Text>⭐ {q.driver.rating.toFixed(1)}</Text>
                <Text>{q.driver.totalJobs} jobs</Text>
                {q.driver.verified && (
                  <Badge colorPalette="green" px={2} py={0.5} borderRadius="md">
                    ✓ Verified
                  </Badge>
                )}
                {q.estimatedDuration && (
                  <Text>⏱ {q.estimatedDuration}</Text>
                )}
              </HStack>

              {q.message && (
                <Text fontSize="sm" color="gray.600" bg="gray.50" p={3} borderRadius="md">
                  &ldquo;{q.message}&rdquo;
                </Text>
              )}

              {/* Status / Actions */}
              {q.status === "accepted" ? (
                <Badge
                  colorPalette="green"
                  px={3}
                  py={1}
                  borderRadius="md"
                  alignSelf="flex-start"
                  fontSize="sm"
                >
                  ✓ Accepted
                </Badge>
              ) : q.status === "rejected" ? (
                <Badge
                  colorPalette="gray"
                  px={3}
                  py={1}
                  borderRadius="md"
                  alignSelf="flex-start"
                  fontSize="sm"
                >
                  Declined
                </Badge>
              ) : !hasAcceptedQuote && !q.driver.stripeOnboarded ? (
                <Text fontSize="xs" color="orange.500" fontWeight="600">
                  ⚠ This driver hasn&apos;t completed payment setup yet
                </Text>
              ) : !hasAcceptedQuote ? (
                <Button
                  size="sm"
                  bg="#059669"
                  color="white"
                  fontWeight="700"
                  alignSelf="flex-start"
                  onClick={() => handleAcceptQuote(q.id)}
                  disabled={accepting !== null}
                  _hover={{ bg: "#047857" }}
                >
                  {accepting === q.id
                    ? "Accepting..."
                    : `Accept — ${formatGBP(q.price)}`}
                </Button>
              ) : null}
            </VStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
