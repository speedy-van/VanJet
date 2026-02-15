"use client";

import { useState, useCallback, Fragment } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Flex,
} from "@chakra-ui/react";
import type { BookingFormData } from "./types";
import { WIZARD_STEPS } from "./types";
import { StepAddresses } from "./StepAddresses";
import { StepItems } from "./StepItems";
import { StepSchedule } from "./StepSchedule";
import { StepReview } from "./StepReview";
import { StepSuccess } from "./StepSuccess";

export function BookingWizard() {
  const searchParams = useSearchParams();
  const initialPickup = searchParams.get("pickup") || "";
  const initialDelivery = searchParams.get("delivery") || "";

  const [step, setStep] = useState(0);
  const form = useForm<BookingFormData>({
    mode: "onTouched",
    defaultValues: {
      pickup: {
        address: initialPickup,
        lat: 0,
        lng: 0,
        floor: 0,
        flat: "",
        hasLift: false,
        notes: "",
        confirmed: false,
        precision: "unknown" as const,
      },
      dropoff: {
        address: initialDelivery,
        lat: 0,
        lng: 0,
        floor: 0,
        flat: "",
        hasLift: false,
        notes: "",
        confirmed: false,
        precision: "unknown" as const,
      },
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      items: [],
      needsPacking: false,
      schedule: {
        preferredDate: "",
        timeWindow: "",
        flexibleDates: false,
      },
      jobType: "house_move",
    },
  });

  const next = useCallback(
    () =>
      setStep((s) =>
        Math.min(s + 1, WIZARD_STEPS.length - 1)
      ),
    []
  );
  const back = useCallback(
    () => setStep((s) => Math.max(s - 1, 0)),
    []
  );

  return (
    <Box minH="100vh" bg="#F9FAFB" py={{ base: 6, md: 10 }}>
      <Container maxW="700px" px={{ base: 4, md: 6 }}>
        {/* Reference Number Badge (sticky at top when available) */}
        {form.watch("referenceNumber") && (
          <Box
            bg="white"
            borderRadius="lg"
            shadow="sm"
            px={4}
            py={2}
            mb={4}
            textAlign="center"
          >
            <Text fontSize="sm" color="gray.600" mb={1}>
              Your Booking Reference
            </Text>
            <Text fontSize="lg" fontWeight="800" color="#1D4ED8">
              {form.watch("referenceNumber")}
            </Text>
          </Box>
        )}

        {/* Progress stepper */}
        {step < WIZARD_STEPS.length - 1 && (
          <ProgressStepper current={step} />
        )}

        {/* Steps */}
        {step === 0 && <StepAddresses form={form} onNext={next} />}
        {step === 1 && (
          <StepItems form={form} onNext={next} onBack={back} />
        )}
        {step === 2 && (
          <StepSchedule
            form={form}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 3 && (
          <StepReview
            form={form}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 4 && <StepSuccess form={form} />}
      </Container>
    </Box>
  );
}

function ProgressStepper({ current }: { current: number }) {
  // Exclude "Confirmed" from the stepper
  const steps = WIZARD_STEPS.slice(0, -1);

  return (
    <HStack
      gap={0}
      mb={8}
      justify="center"
      px={{ base: 0, md: 4 }}
    >
      {steps.map((label, i) => (
        <Fragment key={label}>
          {i > 0 && (
            <Box
              flex={1}
              h="2px"
              bg={i <= current ? "#1D4ED8" : "#E5E7EB"}
              transition="background 0.3s"
            />
          )}
          <VStack gap={1}>
            <Flex
              w={{ base: "28px", md: "32px" }}
              h={{ base: "28px", md: "32px" }}
              borderRadius="full"
              align="center"
              justify="center"
              bg={i <= current ? "#1D4ED8" : "#E5E7EB"}
              color={i <= current ? "white" : "#6B7280"}
              fontSize="xs"
              fontWeight="700"
              transition="background 0.3s"
            >
              {i < current ? "✓" : i + 1}
            </Flex>
            <Text
              fontSize="2xs"
              fontWeight="600"
              color={
                i === current ? "#1D4ED8" : "#9CA3AF"
              }
              display={{ base: "none", md: "block" }}
              textAlign="center"
              whiteSpace="nowrap"
            >
              {label}
            </Text>
          </VStack>
        </Fragment>
      ))}
    </HStack>
  );
}
