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
          <Text color="gray.500">Setting up payment...</Text>
        </VStack>
      </Flex>
    );
  }

  if (error) {
    return (
      <Box maxW="500px" mx="auto" p={6}>
        <Box bg="red.50" p={4} borderRadius="lg">
          <Text color="red.600" fontWeight="600">{error}</Text>
          <Link href={`/job/${jobId}/quotes`}>
            <Button mt={3} variant="ghost" size="sm">
              Back to Quotes
            </Button>
          </Link>
        </Box>
      </Box>
    );
  }

  if (!clientSecret) {
    return (
      <Box maxW="500px" mx="auto" p={6}>
        <Text color="gray.500">
          Unable to initialise payment. Please go back and try again.
        </Text>
      </Box>
    );
  }

  return (
    <Elements
      stripe={getStripeClient()}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#1D4ED8",
            fontFamily: "Inter, sans-serif",
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
        setError(confirmError.message ?? "Payment failed.");
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
          setError("Payment succeeded but booking confirmation failed. Contact support.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed.");
    } finally {
      setProcessing(false);
    }
  }

  if (success) {
    return (
      <Box
        maxW="500px"
        mx="auto"
        bg="white"
        borderRadius="xl"
        shadow="sm"
        p={{ base: 6, md: 10 }}
        textAlign="center"
      >
        <VStack gap={5}>
          <Flex
            w="64px"
            h="64px"
            borderRadius="full"
            bg="#ECFDF5"
            color="#059669"
            align="center"
            justify="center"
            fontSize="2xl"
            fontWeight="800"
          >
            ✓
          </Flex>
          <Text fontSize="xl" fontWeight="800" color="gray.800">
            Booking Confirmed!
          </Text>
          <Text fontSize="sm" color="gray.600">
            Your driver has been notified and will be in touch.
          </Text>
          {trackingToken && (
            <Link href={`/track/${trackingToken}`}>
              <Button
                bg="#059669"
                color="white"
                fontWeight="700"
                _hover={{ bg: "#047857" }}
              >
                Live Tracking
              </Button>
            </Link>
          )}
          <Link href="/">
            <Button
              bg="#1D4ED8"
              color="white"
              fontWeight="700"
              _hover={{ bg: "#1840B8" }}
            >
              Back to Home
            </Button>
          </Link>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      maxW="500px"
      mx="auto"
      bg="white"
      borderRadius="xl"
      shadow="sm"
      p={{ base: 5, md: 8 }}
    >
      <VStack gap={5} align="stretch">
        <Box>
          <Text fontSize="xl" fontWeight="800" color="gray.800">
            Complete Payment
          </Text>
          <Text fontSize="sm" color="gray.500" mt={1}>
            You will be charged{" "}
            <Text as="span" fontWeight="700" color="#1D4ED8">
              {formatGBP(amountGBP)}
            </Text>
          </Text>
        </Box>

        <Box
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="lg"
          p={4}
        >
          <PaymentElement />
        </Box>

        {error && (
          <Text fontSize="sm" color="red.500" fontWeight="600">
            {error}
          </Text>
        )}

        <HStack justify="space-between" pt={2}>
          <Link href={`/job/${jobId}/quotes`}>
            <Button variant="ghost" fontWeight="600" disabled={processing}>
              Back
            </Button>
          </Link>
          <Button
            bg="#1D4ED8"
            color="white"
            size="lg"
            fontWeight="700"
            onClick={handleSubmit}
            disabled={!stripe || processing}
            _hover={{ bg: "#1840B8" }}
          >
            {processing
              ? "Processing..."
              : `Pay ${formatGBP(amountGBP)}`}
          </Button>
        </HStack>
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
      <Box py={{ base: 6, md: 10 }} px={4}>
        <PayPageInner params={params} />
      </Box>
    </Suspense>
  );
}
