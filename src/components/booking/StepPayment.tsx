"use client";

import { useState, useEffect } from "react";
import { Box, VStack, Text, Button, HStack } from "@chakra-ui/react";
import { formatGBP } from "@/lib/money/format";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getStripeClient } from "@/lib/stripe/client";
import type { BookingForm } from "./types";

interface StepPaymentProps {
  form: BookingForm;
  onNext: () => void;
  onBack: () => void;
}

export function StepPayment({
  form,
  onNext,
  onBack,
}: StepPaymentProps) {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const jobId = form.watch("jobId");

  useEffect(() => {
    if (!jobId) return;

    const fetchIntent = async () => {
      try {
        const res = await fetch("/api/payment/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(
            data.error || "Failed to create payment."
          );
        }

        const data = await res.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Payment setup failed."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchIntent();
  }, [jobId]);

  if (loading) {
    return (
      <Box
        bg="white"
        borderRadius="xl"
        shadow="sm"
        p={{ base: 5, md: 8 }}
      >
        <VStack gap={4}>
          <Text fontSize="lg" fontWeight="700" color="gray.700">
            Setting up payment...
          </Text>
          <Text fontSize="sm" color="gray.400">
            This will only take a moment.
          </Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        bg="white"
        borderRadius="xl"
        shadow="sm"
        p={{ base: 5, md: 8 }}
      >
        <VStack gap={4}>
          <Text fontSize="lg" fontWeight="700" color="red.500">
            Payment error
          </Text>
          <Text fontSize="sm" color="gray.600">
            {error}
          </Text>
          <Button variant="ghost" onClick={onBack}>
            Go back
          </Button>
        </VStack>
      </Box>
    );
  }

  if (!clientSecret) {
    return (
      <Box
        bg="white"
        borderRadius="xl"
        shadow="sm"
        p={{ base: 5, md: 8 }}
      >
        <VStack gap={4}>
          <Text color="gray.500">
            Unable to initialise payment. Please go back and try
            again.
          </Text>
          <Button variant="ghost" onClick={onBack}>
            Go back
          </Button>
        </VStack>
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
            colorPrimary: "#0070f3",
            fontFamily: "Inter, sans-serif",
          },
        },
      }}
    >
      <PaymentForm
        form={form}
        onNext={onNext}
        onBack={onBack}
        estimatedPrice={form.watch("estimatedPrice")}
      />
    </Elements>
  );
}

function PaymentForm({
  form,
  onNext,
  onBack,
  estimatedPrice,
}: {
  form: BookingForm;
  onNext: () => void;
  onBack: () => void;
  estimatedPrice?: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!stripe || !elements) return;

    setProcessing(true);
    setError("");

    try {
      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/book?success=true`,
          },
          redirect: "if_required",
        });

      if (confirmError) {
        setError(confirmError.message ?? "Payment failed.");
        setProcessing(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        // Mark the job as paid
        const jobId = form.getValues("jobId");
        const markRes = await fetch("/api/jobs/mark-paid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId,
            paymentIntentId: paymentIntent.id,
          }),
        });

        if (markRes.ok) {
          const data = await markRes.json();
          form.setValue("bookingId", data.bookingId);
          if (data.trackingToken) {
            form.setValue("trackingToken", data.trackingToken);
          }
        }

        onNext();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Payment failed."
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box
      bg="white"
      borderRadius="xl"
      shadow="sm"
      p={{ base: 5, md: 8 }}
    >
      <VStack gap={5} align="stretch">
        <Box>
          <Text fontSize="xl" fontWeight="800" color="gray.800">
            Payment
          </Text>
          {estimatedPrice != null && (
            <Text fontSize="sm" color="gray.500">
              You will be charged{" "}
              <Text as="span" fontWeight="700" color="brand.500">
                {formatGBP(estimatedPrice)}
              </Text>
            </Text>
          )}
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

        <HStack justify="space-between" pt={4}>
          <Button
            variant="ghost"
            onClick={onBack}
            fontWeight="600"
            disabled={processing}
          >
            Back
          </Button>
          <Button
            colorPalette="blue"
            size="lg"
            fontWeight="700"
            onClick={handleSubmit}
            disabled={!stripe || processing}
          >
            {processing
              ? "Processing..."
              : `Pay ${formatGBP(estimatedPrice)}`}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
