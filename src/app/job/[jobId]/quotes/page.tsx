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
  Input,
  Tabs,
  Grid,
  SimpleGrid,
} from "@chakra-ui/react";
import { formatGBP } from "@/lib/money/format";
import Link from "next/link";

interface JobItem {
  id: string;
  name: string;
  category: string | null;
  quantity: number;
  weightKg: number | null;
  volumeM3: number | null;
  fragile: boolean;
  requiresDismantling: boolean;
  notes: string | null;
}

interface QuoteDriver {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
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
  referenceNumber: string;
  jobType: string;
  status: string;
  pickupAddress: string;
  deliveryAddress: string;
  moveDate: string;
  estimatedPrice: number | null;
  distanceMiles: number | null;
  description: string | null;
  pickupFloor: number | null;
  deliveryFloor: number | null;
  pickupHasLift: boolean | null;
  deliveryHasLift: boolean | null;
  needsPacking: boolean;
  contactName: string | null;
  contactPhone: string | null;
}

type SortOption = "price-low" | "price-high" | "rating" | "recent";

export default function JobQuotesPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const [job, setJob] = useState<JobSummary | null>(null);
  const [items, setItems] = useState<JobItem[]>([]);
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
  
  const [sortBy, setSortBy] = useState<SortOption>("price-low");
  const [showDetails, setShowDetails] = useState(true);

  useEffect(() => {
    fetchQuotes();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchQuotes, 30000);
    return () => clearInterval(interval);
  }, [jobId]);

  async function fetchQuotes() {
    try {
      if (!loading && quotes.length > 0) {
        // Silent refresh - don't show loading spinner
      } else {
        setLoading(true);
      }
      
      const res = await fetch(`/api/jobs/${jobId}/quotes`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load quotes.");
      }
      const data = await res.json();
      setJob(data.job);
      setItems(data.items || []);
      setQuotes(data.quotes);
      setError("");
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

      fetchQuotes();
    } catch (err) {
      setAcceptResult({
        error: err instanceof Error ? err.message : "Failed to accept.",
      });
    } finally {
      setAccepting(null);
    }
  }

  // Sort quotes
  const sortedQuotes = [...quotes].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.driver.rating - a.driver.rating;
      case "recent":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  if (loading && quotes.length === 0) {
    return (
      <Flex minH="60vh" align="center" justify="center">
        <VStack gap={3}>
          <Spinner size="lg" color="blue.500" />
          <Text color="gray.500">Ï¼ÏºÏ¦+è Ïº+äÏ¬Ï¡+à+è+ä... Loading quotes...</Text>
        </VStack>
      </Flex>
    );
  }

  if (error && !job) {
    return (
      <Box maxW="600px" mx="auto" p={6}>
        <Box bg="red.50" p={4} borderRadius="lg">
          <Text color="red.600" fontWeight="600">{error}</Text>
          <Button mt={3} onClick={() => window.location.reload()}>
            ÏÑÏ¦ÏºÏ»Ï® Ïº+ä+àÏ¡Ïº+ê+äÏ® Retry
          </Button>
        </Box>
      </Box>
    );
  }

  const hasAcceptedQuote = quotes.some((q) => q.status === "accepted");
  const totalWeight = items.reduce((sum, i) => sum + (i.weightKg || 0) * i.quantity, 0);
  const totalVolume = items.reduce((sum, i) => sum + (i.volumeM3 || 0) * i.quantity, 0);

  return (
    <Box
      minH="100vh"
      bg="#F9FAFB"
      py={{ base: 4, md: 8 }}
      px={{ base: 3, md: 6 }}
    >
      <Box maxW="1200px" mx="auto">
        <VStack gap={5} align="stretch">
          {/* Header with Reference Number */}
          {job && (
            <Box
              bg="white"
              borderRadius="xl"
              shadow="md"
              p={{ base: 4, md: 6 }}
              border="2px solid"
              borderColor="blue.100"
            >
              <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={1}>
                    Ï¦+é+à Ïº+ä+àÏ¦Ï¼Ï¦ BOOKING REFERENCE
                  </Text>
                  <Text
                    fontSize={{ base: "xl", md: "2xl" }}
                    fontWeight="900"
                    color="#1D4ED8"
                    fontFamily="mono"
                    letterSpacing="wider"
                  >
                    {job.referenceNumber}
                  </Text>
                </Box>
                <VStack align="flex-end" gap={1}>
                  <Badge
                    colorPalette={
                      job.status === "accepted"
                        ? "green"
                        : job.status === "quoted"
                          ? "blue"
                          : "gray"
                    }
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="sm"
                    fontWeight="700"
                  >
                    {job.status === "accepted" ? "Ô£ô +à+éÏ¿+ê+ä Accepted" : 
                     job.status === "quoted" ? "­ƒÆ¼ Ï¦Ï¦+êÏÂ Quoted" : job.status}
                  </Badge>
                  <Text fontSize="xs" color="gray.500">
                    {quotes.length} {quotes.length === 1 ? "Ï¦Ï¦ÏÂ Quote" : "Ï¦Ï¦+êÏÂ Quotes"}
                  </Text>
                </VStack>
              </Flex>
            </Box>
          )}

          {/* Accept Result Banner */}
          {acceptResult && !acceptResult.error && (
            <Box
              bg="green.50"
              p={4}
              borderRadius="xl"
              border="2px solid"
              borderColor="green.200"
              shadow="sm"
            >
              <HStack justify="space-between" flexWrap="wrap" gap={3}>
                <Box>
                  <Text fontWeight="800" color="green.700" fontSize="lg">
                    Ô£ô Ï¬+à +éÏ¿+ê+ä Ïº+äÏ¦Ï¦ÏÂ Quote Accepted
                  </Text>
                  <Text fontSize="sm" color="green.600" mt={1}>
                    Ïº+äÏ¦Ï¦Ï¦ Ïº+ä+å+çÏºÏª+è: Final Price: {formatGBP(acceptResult.price ?? 0)}
                  </Text>
                </Box>
                <Link
                  href={`/job/${jobId}/pay?bookingId=${acceptResult.bookingId}&quoteId=${acceptResult.quoteId}`}
                >
                  <Button
                    bg="#059669"
                    color="white"
                    fontWeight="700"
                    size="lg"
                    _hover={{ bg: "#047857" }}
                  >
                    ­ƒÆ¦ ÏºÏ»+üÏ¦ Ïº+äÏó+å Pay Now
                  </Button>
                </Link>
              </HStack>
            </Box>
          )}
          {acceptResult?.error && (
            <Box bg="red.50" p={4} borderRadius="lg" border="1px solid" borderColor="red.200">
              <Text color="red.600" fontWeight="600">{acceptResult.error}</Text>
            </Box>
          )}

          {/* Main Grid: Job Details | Quotes */}
          <Grid
            templateColumns={{ base: "1fr", lg: "400px 1fr" }}
            gap={5}
          >
            {/* LEFT: Job Details */}
            <VStack gap={5} align="stretch">
              {/* Job Summary Card */}
              {job && (
                <Box
                  bg="white"
                  borderRadius="xl"
                  shadow="sm"
                  p={5}
                  border="1px solid"
                  borderColor="gray.100"
                >
                  <HStack justify="space-between" mb={4}>
                    <Text fontSize="lg" fontWeight="800" color="gray.800">
                      ­ƒôª Ï¬+üÏºÏÁ+è+ä Ïº+ä+å+é+ä Job Details
                    </Text>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => setShowDetails(!showDetails)}
                    >
                      {showDetails ? "ÏÑÏ«+üÏºÏí Hide" : "Ï¦Ï¦ÏÂ Show"}
                    </Button>
                  </HStack>

                  {showDetails && (
                    <VStack gap={3} align="stretch" fontSize="sm">
                      <Box>
                        <Text fontWeight="600" color="gray.500" fontSize="xs" mb={1}>
                          +à+å FROM
                        </Text>
                        <Text color="gray.800">{job.pickupAddress}</Text>
                        {job.pickupFloor !== null && (
                          <Text fontSize="xs" color="gray.500">
                            Ïº+äÏÀÏºÏ¿+é {job.pickupFloor} ÔÇó {job.pickupHasLift ? "Ô£ô +àÏÁÏ¦Ï» Lift" : "ÔÜá Ï¿Ï»+ê+å +àÏÁÏ¦Ï» No Lift"}
                          </Text>
                        )}
                      </Box>

                      <Box>
                        <Text fontWeight="600" color="gray.500" fontSize="xs" mb={1}>
                          ÏÑ+ä+ë TO
                        </Text>
                        <Text color="gray.800">{job.deliveryAddress}</Text>
                        {job.deliveryFloor !== null && (
                          <Text fontSize="xs" color="gray.500">
                            Ïº+äÏÀÏºÏ¿+é {job.deliveryFloor} ÔÇó {job.deliveryHasLift ? "Ô£ô +àÏÁÏ¦Ï» Lift" : "ÔÜá Ï¿Ï»+ê+å +àÏÁÏ¦Ï» No Lift"}
                          </Text>
                        )}
                      </Box>

                      <Flex gap={3} flexWrap="wrap" fontSize="xs">
                        <Badge colorPalette="blue" px={2} py={1}>
                          ­ƒôà {new Date(job.moveDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </Badge>
                        {job.distanceMiles && (
                          <Badge colorPalette="gray" px={2} py={1}>
                            ­ƒôÅ {job.distanceMiles} mi
                          </Badge>
                        )}
                        {job.needsPacking && (
                          <Badge colorPalette="orange" px={2} py={1}>
                            ­ƒôª +èÏ¡Ï¬ÏºÏ¼ Ï¬Ï¦+ä+è+ü Needs Packing
                          </Badge>
                        )}
                      </Flex>

                      {job.estimatedPrice && (
                        <Box bg="blue.50" p={3} borderRadius="md">
                          <Text fontSize="xs" color="blue.600" mb={1}>
                            Ïº+äÏ¦Ï¦Ï¦ Ïº+äÏ¬+éÏ»+èÏ¦+è Estimated Price
                          </Text>
                          <Text fontSize="lg" fontWeight="800" color="#1D4ED8">
                            {formatGBP(job.estimatedPrice)}
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  )}
                </Box>
              )}

              {/* Items Card */}
              {items.length > 0 && (
                <Box
                  bg="white"
                  borderRadius="xl"
                  shadow="sm"
                  p={5}
                  border="1px solid"
                  borderColor="gray.100"
                >
                  <Text fontSize="lg" fontWeight="800" color="gray.800" mb={3}>
                    ­ƒôï Ïº+äÏ¦+üÏ¦ Items ({items.reduce((s, i) => s + i.quantity, 0)})
                  </Text>
                  
                  <VStack gap={2} align="stretch" maxH="400px" overflowY="auto">
                    {items.map((item) => (
                      <Box
                        key={item.id}
                        bg="gray.50"
                        p={3}
                        borderRadius="md"
                        fontSize="sm"
                      >
                        <HStack justify="space-between" mb={1}>
                          <Text fontWeight="700" color="gray.800">
                            {item.name}
                          </Text>
                          <Badge colorPalette="blue" px={2} py={0.5}>
                            +ù{item.quantity}
                          </Badge>
                        </HStack>
                        {item.category && (
                          <Text fontSize="xs" color="gray.500">
                            {item.category}
                          </Text>
                        )}
                        <Flex gap={2} mt={1} flexWrap="wrap" fontSize="xs" color="gray.500">
                          {item.weightKg && <Text>ÔÜû´©Å {item.weightKg}kg</Text>}
                          {item.volumeM3 && <Text>­ƒôª {item.volumeM3}m-¦</Text>}
                          {item.fragile && <Text>ÔÜá´©Å +éÏºÏ¿+ä +ä+ä+âÏ¦Ï¦ Fragile</Text>}
                          {item.requiresDismantling && <Text>­ƒöº +èÏ¡Ï¬ÏºÏ¼ +ü+â Dismantling</Text>}
                        </Flex>
                        {item.notes && (
                          <Text fontSize="xs" color="gray.600" mt={2} fontStyle="italic">
                            {item.notes}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </VStack>

                  <Box mt={3} pt={3} borderTop="1px solid" borderColor="gray.200">
                    <HStack justify="space-between" fontSize="sm">
                      <Text color="gray.600">Ïº+ä+êÏ¦+å Ïº+ä+â+ä+è Total Weight:</Text>
                      <Text fontWeight="700">{totalWeight.toFixed(1)} kg</Text>
                    </HStack>
                    <HStack justify="space-between" fontSize="sm">
                      <Text color="gray.600">Ïº+äÏ¡Ï¼+à Ïº+ä+â+ä+è Total Volume:</Text>
                      <Text fontWeight="700">{totalVolume.toFixed(2)} m-¦</Text>
                    </HStack>
                  </Box>
                </Box>
              )}
            </VStack>

            {/* RIGHT: Quotes List */}
            <VStack gap={4} align="stretch">
              {/* Sort Controls */}
              <Box
                bg="white"
                borderRadius="lg"
                shadow="sm"
                p={3}
                border="1px solid"
                borderColor="gray.100"
              >
                <HStack gap={3} flexWrap="wrap">
                  <Text fontSize="sm" fontWeight="600" color="gray.600">
                    Ï¬Ï¦Ï¬+èÏ¿ Sort:
                  </Text>
                  <Box>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      style={{
                        padding: "8px 32px 8px 12px",
                        borderRadius: "8px",
                        border: "1px solid #E2E8F0",
                        fontSize: "14px",
                        fontWeight: "500",
                        backgroundColor: "white",
                        cursor: "pointer",
                      }}
                    >
                      <option value="price-low">Ïú+é+ä Ï¦Ï¦Ï¦ Price: Low ÔåÆ High</option>
                      <option value="price-high">ÏúÏ¦+ä+ë Ï¦Ï¦Ï¦ Price: High ÔåÆ Low</option>
                      <option value="rating">ÏúÏ¦+ä+ë Ï¬+é+è+è+à Rating: High ÔåÆ Low</option>
                      <option value="recent">Ïº+äÏúÏ¡Ï»Ï½ Most Recent</option>
                    </select>
                  </Box>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={fetchQuotes}
                    ml="auto"
                  >
                    ­ƒöä Ï¬Ï¡Ï»+èÏ½ Refresh
                  </Button>
                </HStack>
              </Box>

              {/* Quotes Grid */}
              {quotes.length === 0 && (
                <Box
                  bg="white"
                  borderRadius="xl"
                  shadow="sm"
                  p={12}
                  textAlign="center"
                  border="2px dashed"
                  borderColor="gray.200"
                >
                  <Text fontSize="3xl" mb={2}>­ƒô¡</Text>
                  <Text fontSize="lg" fontWeight="700" color="gray.600">
                    +äÏº Ï¬+êÏ¼Ï» Ï¦Ï¦+êÏÂ Ï¿Ï¦Ï» No Quotes Yet
                  </Text>
                  <Text fontSize="sm" color="gray.400" mt={2}>
                    Ïº+äÏ¦ÏºÏª+é+ê+å +ü+è +à+åÏÀ+éÏ¬+â Ï¦+èÏ¿Ï»Ïú+ê+å Ï¿ÏÑÏ¦Ï¦Ïº+ä Ï¦Ï¦+êÏÂ+ç+à +éÏ¦+èÏ¿Ïº+ï
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    Drivers in your area will start sending quotes shortly
                  </Text>
                </Box>
              )}

              {sortedQuotes.map((q) => (
                <Box
                  key={q.id}
                  bg="white"
                  borderRadius="xl"
                  shadow="md"
                  border="2px solid"
                  borderColor={
                    q.status === "accepted"
                      ? "green.300"
                      : q.status === "rejected"
                        ? "gray.200"
                        : "blue.100"
                  }
                  p={{ base: 4, md: 6 }}
                  opacity={q.status === "rejected" ? 0.5 : 1}
                  transition="all 0.2s"
                  _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                >
                  <VStack gap={4} align="stretch">
                    {/* Driver Header */}
                    <Flex justify="space-between" align="flex-start" gap={3}>
                      <HStack gap={3}>
                        <Flex
                          w="50px"
                          h="50px"
                          borderRadius="full"
                          bg="gradient-to-r from-blue-400 to-blue-600"
                          color="white"
                          align="center"
                          justify="center"
                          fontWeight="900"
                          fontSize="xl"
                        >
                          {q.driver.name.charAt(0).toUpperCase()}
                        </Flex>
                        <Box>
                          <HStack gap={2}>
                            <Text fontWeight="800" fontSize="md" color="gray.800">
                              {q.driver.name}
                            </Text>
                            {q.driver.verified && (
                              <Badge colorPalette="green" px={2} py={0.5} fontSize="xs">
                                Ô£ô +à+êÏ½+é Verified
                              </Badge>
                            )}
                          </HStack>
                          {q.driver.companyName && (
                            <Text fontSize="sm" color="gray.500">
                              {q.driver.companyName}
                            </Text>
                          )}
                          <HStack gap={2} mt={1} fontSize="xs" color="gray.500">
                            <Text>Ô¡É {q.driver.rating.toFixed(1)}</Text>
                            <Text>ÔÇó</Text>
                            <Text>{q.driver.totalJobs} +êÏ©+è+üÏ® jobs</Text>
                          </HStack>
                        </Box>
                      </HStack>

                      <VStack align="flex-end" gap={1}>
                        <Text fontSize="2xl" fontWeight="900" color="#1D4ED8">
                          {formatGBP(q.price)}
                        </Text>
                        {job?.estimatedPrice && (
                          <Text fontSize="xs" color={
                            q.price < job.estimatedPrice ? "green.600" : "orange.600"
                          }>
                            {q.price < job.estimatedPrice 
                              ? `Ïú+é+ä Ï¿+Ç ${formatGBP(job.estimatedPrice - q.price)}`
                              : `ÏúÏ¦+ä+ë Ï¿+Ç ${formatGBP(q.price - job.estimatedPrice)}`}
                          </Text>
                        )}
                      </VStack>
                    </Flex>

                    {/* Driver Details */}
                    <Flex gap={2} flexWrap="wrap" fontSize="xs">
                      {q.driver.vanSize && (
                        <Badge colorPalette="gray" px={2} py={1}>
                          ­ƒÜÉ {q.driver.vanSize}
                        </Badge>
                      )}
                      {q.estimatedDuration && (
                        <Badge colorPalette="blue" px={2} py={1}>
                          ÔÅ¦ {q.estimatedDuration}
                        </Badge>
                      )}
                      {q.driver.email && (
                        <Badge colorPalette="gray" px={2} py={1}>
                          Ô£ë´©Å {q.driver.email}
                        </Badge>
                      )}
                      {q.driver.phone && (
                        <Badge colorPalette="gray" px={2} py={1}>
                          ­ƒô× {q.driver.phone}
                        </Badge>
                      )}
                    </Flex>

                    {/* Driver Message */}
                    {q.message && (
                      <Box bg="blue.50" p={3} borderRadius="md">
                        <Text fontSize="sm" color="gray.700">
                          ­ƒÆ¼ &ldquo;{q.message}&rdquo;
                        </Text>
                      </Box>
                    )}

                    {/* Actions */}
                    {q.status === "accepted" ? (
                      <Badge
                        colorPalette="green"
                        px={4}
                        py={2}
                        borderRadius="lg"
                        alignSelf="flex-start"
                        fontSize="md"
                        fontWeight="700"
                      >
                        Ô£ô Ï¬+à Ïº+ä+éÏ¿+ê+ä Accepted
                      </Badge>
                    ) : q.status === "rejected" ? (
                      <Badge
                        colorPalette="gray"
                        px={4}
                        py={2}
                        borderRadius="lg"
                        alignSelf="flex-start"
                        fontSize="md"
                      >
                        Ô£ù +àÏ¦+ü+êÏÂ Rejected
                      </Badge>
                    ) : !hasAcceptedQuote && !q.driver.stripeOnboarded ? (
                      <Text fontSize="sm" color="orange.600" fontWeight="600">
                        ÔÜá +çÏ¦Ïº Ïº+äÏ¦ÏºÏª+é +ä+à +è+â+à+ä ÏÑÏ¦Ï»ÏºÏ» Ïº+äÏ»+üÏ¦ Ï¿Ï¦Ï»
                        <br />
                        This driver hasn&apos;t completed payment setup yet
                      </Text>
                    ) : !hasAcceptedQuote ? (
                      <Button
                        size="lg"
                        bg="#059669"
                        color="white"
                        fontWeight="700"
                        onClick={() => handleAcceptQuote(q.id)}
                        disabled={accepting !== null}
                        _hover={{ bg: "#047857" }}
                        _disabled={{ opacity: 0.6 }}
                      >
                        {accepting === q.id
                          ? "Ï¼ÏºÏ¦+è Ïº+ä+éÏ¿+ê+ä... Accepting..."
                          : `Ô£ô +éÏ¿+ê+ä Accept ÔÇö ${formatGBP(q.price)}`}
                      </Button>
                    ) : null}

                    <Text fontSize="xs" color="gray.400" textAlign="right">
                      Ï¬+à Ïº+äÏÑÏ¦Ï¦Ïº+ä Submitted: {new Date(q.createdAt).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </VStack>
                </Box>
              ))}
            </VStack>
          </Grid>
        </VStack>
      </Box>
    </Box>
  );
}
