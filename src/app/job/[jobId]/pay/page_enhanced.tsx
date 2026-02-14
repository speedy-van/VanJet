"use client";

import { useState, useEffect, Suspense, use } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Flex,
  Spinner,
  Badge,
  SimpleGrid,
} from "@chakra-ui/react";
import { formatGBP } from "@/lib/money/format";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getStripeClient } from "@/lib/stripe/client";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface JobDetails {
  id: string;
  referenceNumber: string;
  pickupAddress: string;
  deliveryAddress: string;
  moveDate: string;
  distanceMiles: number | null;
}

interface QuoteDetails {
  id: string;
  price: number;
  driverName: string;
  driverCompany: string | null;
  vanSize: string | null;
}

function PayPageInner({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const quoteId = searchParams.get("quoteId");
  const router = useRouter();

  const [clientSecret, setClientSecret] = useState("");
  const [amountPence, setAmountPence] = useState(0);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!jobId || !quoteId) {
      setError("Missing job or quote information.");
      setLoading(false);
      return;
    }

    async function fetchIntent() {
      try {
        const res = await fetch("/api/payment/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId, quoteId }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create payment.");
        }

        const data = await res.json();
        setClientSecret(data.clientSecret);
        setAmountPence(data.amountPence);
        setJobDetails(data.job || null);
        setQuoteDetails(data.quote || null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Payment setup failed."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchIntent();
  }, [jobId, quoteId]);

  if (loading) {
    return (
      <Flex minH="60vh" align="center" justify="center">
        <VStack gap={3}>
          <Spinner size="lg" color="blue.500" />
          <Text color="gray.500">جاري تجهيز الدفع... Setting up payment...</Text>
        </VStack>
      </Flex>
    );
  }

  if (error) {
    return (
      <Box maxW="600px" mx="auto" p={6}>
        <Box bg="red.50" p={6} borderRadius="xl" border="1px solid" borderColor="red.200">
          <Text fontSize="lg" fontWeight="700" color="red.700" mb={2}>
            ⚠ خطأ في الدفع Payment Error
          </Text>
          <Text color="red.600" fontSize="sm">{error}</Text>
          <Link href={`/job/${jobId}/quotes`}>
            <Button mt={4} colorPalette="red" variant="outline">
              ← العودة للعروض Back to Quotes
            </Button>
          </Link>
        </Box>
      </Box>
    );
  }

  if (!clientSecret) {
    return (
      <Box maxW="600px" mx="auto" p={6}>
        <Text color="gray.500">
          غير قادر على تهيئة الدفع. يرجى العودة والمحاولة مرة أخرى.
        </Text>
        <Text color="gray.500" fontSize="sm" mt={2}>
          Unable to initialize payment. Please go back and try again.
        </Text>
      </Box>
    );
  }

  return (
    <Box maxW="900px" mx="auto">
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
        {/* LEFT: Booking Summary */}
        {(jobDetails || quoteDetails) && (
          <VStack gap={5} align="stretch">
            {/* Reference Number Card */}
            {jobDetails?.referenceNumber && (
              <Box
                bg="white"
                borderRadius="xl"
                shadow="md"
                p={5}
                border="2px solid"
                borderColor="blue.100"
              >
                <Text fontSize="xs" color="gray.500" mb={1}>
                  رقم المرجع BOOKING REFERENCE
                </Text>
                <Text
                  fontSize="2xl"
                  fontWeight="900"
                  color="#1D4ED8"
                  fontFamily="mono"
                  letterSpacing="wider"
                >
                  {jobDetails.referenceNumber}
                </Text>
              </Box>
            )}

            {/* Job Details Card */}
            {jobDetails && (
              <Box
                bg="white"
                borderRadius="xl"
                shadow="sm"
                p={5}
                border="1px solid"
                borderColor="gray.100"
              >
                <Text fontSize="lg" fontWeight="800" color="gray.800" mb={3}>
                  📦 تفاصيل النقل Job Details
                </Text>
                <VStack gap={3} align="stretch" fontSize="sm">
                  <Box>
                    <Text fontWeight="600" color="gray.500" fontSize="xs" mb={1}>
                      من FROM
                    </Text>
                    <Text color="gray.800">{jobDetails.pickupAddress}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="600" color="gray.500" fontSize="xs" mb={1}>
                      إلى TO
                    </Text>
                    <Text color="gray.800">{jobDetails.deliveryAddress}</Text>
                  </Box>
                  <Flex gap={2} flexWrap="wrap" fontSize="xs">
                    <Badge colorPalette="blue" px={2} py={1}>
                      📅 {new Date(jobDetails.moveDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Badge>
                    {jobDetails.distanceMiles && (
                      <Badge colorPalette="gray" px={2} py={1}>
                        📏 {jobDetails.distanceMiles} mi
                      </Badge>
                    )}
                  </Flex>
                </VStack>
              </Box>
            )}

            {/* Quote Details Card */}
            {quoteDetails && (
              <Box
                bg="white"
                borderRadius="xl"
                shadow="sm"
                p={5}
                border="1px solid"
                borderColor="gray.100"
              >
                <Text fontSize="lg" fontWeight="800" color="gray.800" mb={3}>
                  👤 معلومات السائق Driver Info
                </Text>
                <VStack gap={2} align="stretch" fontSize="sm">
                  <HStack justify="space-between">
                    <Text color="gray.600">اسم السائق Name:</Text>
                    <Text fontWeight="700">{quoteDetails.driverName}</Text>
                  </HStack>
                  {quoteDetails.driverCompany && (
                    <HStack justify="space-between">
                      <Text color="gray.600">الشركة Company:</Text>
                      <Text fontWeight="700">{quoteDetails.driverCompany}</Text>
                    </HStack>
                  )}
                  {quoteDetails.vanSize && (
                    <HStack justify="space-between">
                      <Text color="gray.600">حجم السيارة Van:</Text>
                      <Badge colorPalette="gray" px={2} py={1}>
                        🚐 {quoteDetails.vanSize}
                      </Badge>
                    </HStack>
                  )}
                </VStack>
              </Box>
            )}

            {/* Price Summary Card */}
            <Box
              bg="gradient-to-br from-blue-50 to-blue-100"
              borderRadius="xl"
              shadow="md"
              p={5}
              border="2px solid"
              borderColor="blue.200"
            >
              <Text fontSize="sm" color="blue.700" mb={2}>
                المبلغ الإجمالي Total Amount
              </Text>
              <Text fontSize="3xl" fontWeight="900" color="#1D4ED8">
                {formatGBP(amountPence / 100)}
              </Text>
              <Text fontSize="xs" color="blue.600" mt={1}>
                شامل جميع الرسوم Including all fees
              </Text>
            </Box>
          </VStack>
        )}

        {/* RIGHT: Payment Form */}
        <Elements
          stripe={getStripeClient()}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#1D4ED8",
                fontFamily: "Inter, sans-serif",
                borderRadius: "12px",
              },
            },
          }}
        >
          <QuotePaymentForm
            jobId={jobId}
            bookingId={bookingId}
            quoteId={quoteId}
            amountPence={amountPence}
          />
        </Elements>
      </SimpleGrid>
    </Box>
  );
}

function QuotePaymentForm({
  jobId,
  bookingId,
  quoteId,
  amountPence,
}: {
  jobId: string;
  bookingId: string | null;
  quoteId: string | null;
  amountPence: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [trackingToken, setTrackingToken] = useState("");

  const amountGBP = amountPence / 100;

  async function handleSubmit() {
    if (!stripe || !elements) return;

    setProcessing(true);
    setError("");

    try {
      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/job/${jobId}/quotes`,
          },
          redirect: "if_required",
        });

      if (confirmError) {
        setError(confirmError.message ?? "فشل الدفع Payment failed.");
        setProcessing(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        // Mark as paid
        const markRes = await fetch("/api/jobs/mark-paid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId,
            paymentIntentId: paymentIntent.id,
            bookingId,
            quoteId,
          }),
        });

        if (markRes.ok) {
          const data = await markRes.json();
          setTrackingToken(data.trackingToken ?? "");
          setSuccess(true);
        } else {
          setError("تم الدفع بنجاح لكن فشل تأكيد الحجز. يرجى التواصل مع الدعم.");
          setError("Payment succeeded but booking confirmation failed. Contact support.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل الدفع Payment failed.");
    } finally {
      setProcessing(false);
    }
  }

  if (success) {
    return (
      <Box
        bg="white"
        borderRadius="xl"
        shadow="lg"
        p={{ base: 6, md: 10 }}
        textAlign="center"
        border="2px solid"
        borderColor="green.200"
      >
        <VStack gap={5}>
          <Flex
            w="80px"
            h="80px"
            borderRadius="full"
            bg="gradient-to-br from-green-400 to-green-600"
            color="white"
            align="center"
            justify="center"
            fontSize="4xl"
            fontWeight="800"
            shadow="lg"
          >
            ✓
          </Flex>
          <Text fontSize="2xl" fontWeight="900" color="gray.800">
            تم تأكيد الحجز!
          </Text>
          <Text fontSize="lg" fontWeight="700" color="green.600">
            Booking Confirmed!
          </Text>
          <Text fontSize="sm" color="gray.600" maxW="300px">
            تم إشعار السائق وسيتواصل معك قريباً
          </Text>
          <Text fontSize="sm" color="gray.600" maxW="300px">
            Your driver has been notified and will be in touch shortly
          </Text>
          
          <VStack gap={3} w="full" pt={3}>
            {trackingToken && (
              <Link href={`/track/${trackingToken}`} style={{ width: "100%" }}>
                <Button
                  w="full"
                  size="lg"
                  bg="#059669"
                  color="white"
                  fontWeight="700"
                  _hover={{ bg: "#047857" }}
                >
                  📍 التتبع المباشر Live Tracking
                </Button>
              </Link>
            )}
            <Link href={`/job/${jobId}/quotes`} style={{ width: "100%" }}>
              <Button
                w="full"
                size="lg"
                bg="#1D4ED8"
                color="white"
                fontWeight="700"
                _hover={{ bg: "#1840B8" }}
              >
                عرض الحجز View Booking
              </Button>
            </Link>
            <Link href="/" style={{ width: "100%" }}>
              <Button w="full" variant="outline" fontWeight="600">
                العودة للرئيسية Back to Home
              </Button>
            </Link>
          </VStack>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      bg="white"
      borderRadius="xl"
      shadow="lg"
      p={{ base: 5, md: 8 }}
      border="1px solid"
      borderColor="gray.100"
      position="sticky"
      top="20px"
    >
      <VStack gap={5} align="stretch">
        <Box>
          <Text fontSize="xl" fontWeight="800" color="gray.800">
            💳 إتمام الدفع Complete Payment
          </Text>
          <Text fontSize="sm" color="gray.500" mt={2}>
            ستتم محاسبتك بمبلغ You will be charged{" "}
            <Text as="span" fontWeight="800" color="#1D4ED8" fontSize="lg">
              {formatGBP(amountGBP)}
            </Text>
          </Text>
        </Box>

        <Box
          borderWidth="2px"
          borderColor="gray.200"
          borderRadius="xl"
          p={4}
          bg="gray.50"
        >
          <PaymentElement />
        </Box>

        {error && (
          <Box bg="red.50" p={3} borderRadius="lg" border="1px solid" borderColor="red.200">
            <Text fontSize="sm" color="red.600" fontWeight="600">
              {error}
            </Text>
          </Box>
        )}

        <VStack gap={2} pt={2}>
          <Button
            w="full"
            size="lg"
            bg="#1D4ED8"
            color="white"
            fontWeight="700"
            onClick={handleSubmit}
            disabled={!stripe || processing}
            _hover={{ bg: "#1840B8" }}
            _disabled={{ opacity: 0.6 }}
          >
            {processing
              ? "جاري المعالجة... Processing..."
              : `ادفع ${formatGBP(amountGBP)} Pay ${formatGBP(amountGBP)}`}
          </Button>
          <Link href={`/job/${jobId}/quotes`} style={{ width: "100%" }}>
            <Button
              w="full"
              variant="ghost"
              fontWeight="600"
              disabled={processing}
            >
              ← العودة Back
            </Button>
          </Link>
        </VStack>

        <Box pt={3} borderTop="1px solid" borderColor="gray.200">
          <Text fontSize="xs" color="gray.500" textAlign="center">
            🔒 دفع آمن بواسطة Stripe Secure payment powered by Stripe
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}

export default function QuotePayPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <Flex minH="60vh" align="center" justify="center">
          <Spinner size="lg" color="blue.500" />
        </Flex>
      }
    >
      <Box
        minH="100vh"
        bg="#F9FAFB"
        py={{ base: 6, md: 10 }}
        px={{ base: 3, md: 6 }}
      >
        <PayPageInner params={params} />
      </Box>
    </Suspense>
  );
}
