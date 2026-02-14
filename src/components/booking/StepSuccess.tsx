"use client";

import { Box, VStack, Text, Button, Flex, SimpleGrid } from "@chakra-ui/react";
import Link from "next/link";
import type { BookingForm } from "./types";

interface StepSuccessProps {
  form: BookingForm;
}

const NEXT_STEPS = [
  {
    icon: "📩",
    title: "Drivers send quotes",
    description:
      "Verified drivers in your area will review your request and send competitive quotes — usually within minutes.",
  },
  {
    icon: "⚖️",
    title: "Compare & choose",
    description:
      "Review each driver\u2019s price, rating, van size, and reviews. Pick the one that suits you best.",
  },
  {
    icon: "💳",
    title: "Pay & track",
    description:
      "Pay securely online. Your driver is confirmed instantly and you can track your move in real time.",
  },
];

export function StepSuccess({ form }: StepSuccessProps) {
  const jobId = form.watch("jobId");

  return (
    <Box
      bg="white"
      borderRadius="12px"
      boxShadow="0 1px 3px rgba(0,0,0,0.08)"
      p={{ base: 6, md: 10 }}
      textAlign="center"
    >
      <VStack gap={6}>
        {/* ── Success icon ─────────────────────────────────── */}
        <Flex
          w="80px"
          h="80px"
          borderRadius="full"
          bg="#ECFDF5"
          color="#059669"
          align="center"
          justify="center"
          fontSize="3xl"
          fontWeight="800"
        >
          ✓
        </Flex>

        <Text fontSize="1.75rem" fontWeight="800" color="#111827">
          Request submitted!
        </Text>

        <Text fontSize="15px" color="#4B5563" maxW="420px" lineHeight="1.7">
          Your move request is now live. Verified drivers in your area will
          start sending quotes shortly — no commitment until you choose one.
        </Text>

        {jobId && (
          <Box bg="#F9FAFB" px={5} py={3} borderRadius="8px">
            <Text fontSize="14px" color="#6B7280">
              Request reference
            </Text>
            <Text
              fontSize="lg"
              fontWeight="700"
              color="#111827"
              fontFamily="mono"
            >
              {jobId.slice(0, 8).toUpperCase()}
            </Text>
          </Box>
        )}

        <Text fontSize="14px" color="#6B7280">
          A confirmation email has been sent to your email address.
        </Text>

        {/* ── What happens next — 3-step guide ─────────────── */}
        <Box w="full" mt={2}>
          <Text
            fontSize="md"
            fontWeight="700"
            color="#111827"
            mb={4}
            textAlign="center"
          >
            What happens next?
          </Text>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            {NEXT_STEPS.map((step, i) => (
              <Box
                key={i}
                bg="#F9FAFB"
                borderRadius="10px"
                p={5}
                textAlign="center"
                borderWidth="1px"
                borderColor="#E5E7EB"
              >
                <Text fontSize="2xl" mb={2}>
                  {step.icon}
                </Text>
                <Text
                  fontSize="14px"
                  fontWeight="700"
                  color="#111827"
                  mb={1}
                >
                  {step.title}
                </Text>
                <Text fontSize="13px" color="#6B7280" lineHeight="1.6">
                  {step.description}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* ── CTA buttons ──────────────────────────────────── */}
        {jobId && (
          <Link href={`/job/${jobId}/quotes`}>
            <Button
              bg="#F59E0B"
              color="white"
              size="lg"
              fontWeight="700"
              borderRadius="8px"
              h="48px"
              w="full"
              _hover={{ bg: "#D97706" }}
            >
              View Driver Quotes →
            </Button>
          </Link>
        )}

        <Link href="/">
          <Button
            bg="#1D4ED8"
            color="white"
            size="lg"
            fontWeight="700"
            borderRadius="8px"
            h="48px"
            _hover={{ bg: "#1840B8" }}
          >
            Back to Home
          </Button>
        </Link>
      </VStack>
    </Box>
  );
}
