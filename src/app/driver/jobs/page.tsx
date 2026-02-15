"use client";

import { useState, useEffect } from "react";
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

interface AvailableJob {
  id: string;
  jobType: string;
  status: string;
  // Pickup details
  pickupAddress: string;
  pickupFloor: number | null;
  pickupFlat: string | null;
  pickupHasLift: boolean | null;
  pickupNotes: string | null;
  // Delivery details
  deliveryAddress: string;
  deliveryFloor: number | null;
  deliveryFlat: string | null;
  deliveryHasLift: boolean | null;
  deliveryNotes: string | null;
  // Route
  distanceMiles: number | null;
  // Schedule
  moveDate: string;
  preferredTimeWindow: string | null;
  flexibleDates: boolean | null;
  // Details
  estimatedPrice: number | null;
  description: string | null;
  needsPacking: boolean | null;
  // Contact
  contactName: string | null;
  contactPhone: string | null;
  // Computed
  itemCount: number;
  distanceFromDriver: number | null;
  alreadyQuoted: boolean;
  createdAt: string;
}

export default function DriverJobsPage() {
  const [jobs, setJobs] = useState<AvailableJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Quote modal state
  const [quoteJobId, setQuoteJobId] = useState<string | null>(null);
  const [quotePrice, setQuotePrice] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [quoteDuration, setQuoteDuration] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      setLoading(true);
      const res = await fetch("/api/driver/jobs/available");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load jobs.");
      }
      const data = await res.json();
      setJobs(data.jobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitQuote() {
    if (!quoteJobId || !quotePrice) return;
    const price = parseFloat(quotePrice);
    if (isNaN(price) || price <= 0) {
      setSubmitResult("Please enter a valid price.");
      return;
    }

    setSubmitting(true);
    setSubmitResult("");

    try {
      const res = await fetch("/api/driver/quotes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: quoteJobId,
          price,
          message: quoteMessage.trim() || undefined,
          estimatedDurationMinutes: quoteDuration
            ? parseInt(quoteDuration)
            : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit quote.");

      setSubmitResult("Quote submitted successfully!");
      setQuoteJobId(null);
      setQuotePrice("");
      setQuoteMessage("");
      setQuoteDuration("");

      // Refresh job list
      fetchJobs();
    } catch (err) {
      setSubmitResult(
        err instanceof Error ? err.message : "Failed to submit quote."
      );
    } finally {
      setSubmitting(false);
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

  return (
    <Box
      maxW="800px"
      mx="auto"
      px={{ base: 4, md: 6 }}
      py={{ base: 6, md: 10 }}
    >
      <VStack gap={6} align="stretch">
        <Box>
          <Text fontSize="2xl" fontWeight="800" color="gray.800">
            Available Jobs
          </Text>
          <Text fontSize="sm" color="gray.500">
            {jobs.length} job{jobs.length !== 1 ? "s" : ""} available in your
            area
          </Text>
        </Box>

        {jobs.length === 0 && (
          <Box
            bg="white"
            borderRadius="xl"
            shadow="sm"
            p={8}
            textAlign="center"
          >
            <Text fontSize="lg" color="gray.500">
              No available jobs at the moment.
            </Text>
            <Text fontSize="sm" color="gray.400" mt={2}>
              Check back soon — new jobs are posted daily.
            </Text>
          </Box>
        )}

        {jobs.map((job) => (
          <Box
            key={job.id}
            bg="white"
            borderRadius="xl"
            shadow="sm"
            border="1px solid"
            borderColor="gray.100"
            p={{ base: 4, md: 6 }}
            _hover={{
              borderColor: "blue.200",
              shadow: "md",
            }}
            transition="all 0.2s"
          >
            <VStack gap={3} align="stretch">
              {/* Header */}
              <HStack justify="space-between" flexWrap="wrap">
                <HStack gap={2}>
                  <Badge
                    colorPalette="blue"
                    px={2}
                    py={0.5}
                    borderRadius="md"
                    fontSize="xs"
                    fontWeight="600"
                  >
                    {job.jobType.replace(/_/g, " ")}
                  </Badge>
                  {job.distanceFromDriver !== null && (
                    <Badge
                      colorPalette="green"
                      px={2}
                      py={0.5}
                      borderRadius="md"
                      fontSize="xs"
                    >
                      {job.distanceFromDriver} mi away
                    </Badge>
                  )}
                  {job.needsPacking && (
                    <Badge
                      colorPalette="orange"
                      px={2}
                      py={0.5}
                      borderRadius="md"
                      fontSize="xs"
                    >
                      Packing needed
                    </Badge>
                  )}
                  {job.flexibleDates && (
                    <Badge
                      colorPalette="purple"
                      px={2}
                      py={0.5}
                      borderRadius="md"
                      fontSize="xs"
                    >
                      Flexible (±2 days)
                    </Badge>
                  )}
                </HStack>
                {job.estimatedPrice && (
                  <Text fontSize="lg" fontWeight="800" color="#1D4ED8">
                    {formatGBP(job.estimatedPrice)}
                  </Text>
                )}
              </HStack>

              {/* Pickup Details */}
              <Box bg="green.50" p={3} borderRadius="md">
                <Text fontSize="xs" fontWeight="700" color="green.600" mb={1.5}>
                  PICKUP
                </Text>
                <Text fontSize="sm" color="gray.800" mb={1}>
                  {job.pickupAddress}
                </Text>
                <HStack gap={3} flexWrap="wrap" fontSize="xs" color="gray.600">
                  <Text>
                    Floor: {job.pickupFloor === 0 || job.pickupFloor === null ? "Ground" : job.pickupFloor}
                  </Text>
                  {job.pickupFlat && <Text>Unit: {job.pickupFlat}</Text>}
                  <Text>Lift: {job.pickupHasLift ? "Yes" : "No"}</Text>
                </HStack>
                {job.pickupNotes && (
                  <Text fontSize="xs" color="gray.500" mt={1.5} fontStyle="italic">
                    📝 {job.pickupNotes}
                  </Text>
                )}
              </Box>

              {/* Delivery Details */}
              <Box bg="red.50" p={3} borderRadius="md">
                <Text fontSize="xs" fontWeight="700" color="red.600" mb={1.5}>
                  DROP-OFF
                </Text>
                <Text fontSize="sm" color="gray.800" mb={1}>
                  {job.deliveryAddress}
                </Text>
                <HStack gap={3} flexWrap="wrap" fontSize="xs" color="gray.600">
                  <Text>
                    Floor: {job.deliveryFloor === 0 || job.deliveryFloor === null ? "Ground" : job.deliveryFloor}
                  </Text>
                  {job.deliveryFlat && <Text>Unit: {job.deliveryFlat}</Text>}
                  <Text>Lift: {job.deliveryHasLift ? "Yes" : "No"}</Text>
                </HStack>
                {job.deliveryNotes && (
                  <Text fontSize="xs" color="gray.500" mt={1.5} fontStyle="italic">
                    📝 {job.deliveryNotes}
                  </Text>
                )}
              </Box>

              {/* Schedule Details */}
              <HStack gap={4} fontSize="xs" color="gray.500" flexWrap="wrap">
                <Text>
                  📅{" "}
                  {new Date(job.moveDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
                {job.preferredTimeWindow && (
                  <Text>
                    🕐{" "}
                    {job.preferredTimeWindow === "morning"
                      ? "Morning (7am–12pm)"
                      : job.preferredTimeWindow === "afternoon"
                        ? "Afternoon (12pm–5pm)"
                        : job.preferredTimeWindow === "evening"
                          ? "Evening (5pm–8pm)"
                          : job.preferredTimeWindow}
                  </Text>
                )}
                {job.distanceMiles && <Text>📏 {job.distanceMiles} mi</Text>}
                <Text>📦 {job.itemCount} item{job.itemCount !== 1 ? "s" : ""}</Text>
              </HStack>

              {/* Special Instructions */}
              {job.description && (
                <Box bg="yellow.50" p={2.5} borderRadius="md">
                  <Text fontSize="xs" fontWeight="600" color="yellow.700" mb={1}>
                    Special Instructions
                  </Text>
                  <Text fontSize="sm" color="gray.700">
                    {job.description}
                  </Text>
                </Box>
              )}

              {/* Contact Details */}
              {(job.contactName || job.contactPhone) && (
                <Box bg="gray.50" p={2.5} borderRadius="md">
                  <Text fontSize="xs" fontWeight="600" color="gray.600" mb={1}>
                    Contact
                  </Text>
                  <HStack gap={4} fontSize="sm" color="gray.700" flexWrap="wrap">
                    {job.contactName && <Text>👤 {job.contactName}</Text>}
                    {job.contactPhone && <Text>📞 {job.contactPhone}</Text>}
                  </HStack>
                </Box>
              )}

              {/* Action */}
              {job.alreadyQuoted ? (
                <Badge
                  colorPalette="gray"
                  px={3}
                  py={1}
                  borderRadius="md"
                  alignSelf="flex-start"
                  fontSize="sm"
                >
                  ✓ Quote submitted
                </Badge>
              ) : quoteJobId === job.id ? (
                <Box
                  bg="gray.50"
                  p={4}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <VStack gap={3} align="stretch">
                    <Text fontSize="sm" fontWeight="700" color="gray.700">
                      Submit Your Quote
                    </Text>

                    <Box>
                      <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>
                        Price (£) *
                      </Text>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        placeholder="e.g. 150.00"
                        value={quotePrice}
                        onChange={(e) => setQuotePrice(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid #E2E8F0",
                          fontSize: "14px",
                          outline: "none",
                        }}
                      />
                    </Box>

                    <Box>
                      <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>
                        Estimated Duration (minutes)
                      </Text>
                      <input
                        type="number"
                        min="15"
                        step="15"
                        placeholder="e.g. 120"
                        value={quoteDuration}
                        onChange={(e) => setQuoteDuration(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid #E2E8F0",
                          fontSize: "14px",
                          outline: "none",
                        }}
                      />
                    </Box>

                    <Box>
                      <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>
                        Message to Customer
                      </Text>
                      <textarea
                        rows={2}
                        placeholder="Brief message about your service..."
                        value={quoteMessage}
                        onChange={(e) => setQuoteMessage(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid #E2E8F0",
                          fontSize: "14px",
                          resize: "vertical",
                          outline: "none",
                        }}
                      />
                    </Box>

                    {submitResult && (
                      <Text
                        fontSize="sm"
                        color={
                          submitResult.includes("success")
                            ? "green.600"
                            : "red.500"
                        }
                        fontWeight="600"
                      >
                        {submitResult}
                      </Text>
                    )}

                    <HStack gap={2}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setQuoteJobId(null);
                          setSubmitResult("");
                        }}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        bg="#1D4ED8"
                        color="white"
                        fontWeight="700"
                        onClick={handleSubmitQuote}
                        disabled={submitting || !quotePrice}
                        _hover={{ bg: "#1840B8" }}
                      >
                        {submitting ? "Submitting..." : "Submit Quote"}
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              ) : (
                <Button
                  size="sm"
                  bg="#1D4ED8"
                  color="white"
                  fontWeight="700"
                  alignSelf="flex-start"
                  onClick={() => {
                    setQuoteJobId(job.id);
                    setSubmitResult("");
                    // Pre-fill with estimated price if available
                    if (job.estimatedPrice) {
                      setQuotePrice(String(job.estimatedPrice));
                    }
                  }}
                  _hover={{ bg: "#1840B8" }}
                >
                  Send Quote
                </Button>
              )}
            </VStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
