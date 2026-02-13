"use client";

import { Box, VStack, Text, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";
import type { BookingForm } from "./types";

interface StepSuccessProps {
  form: BookingForm;
}

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
          Booking confirmed!
        </Text>

        <Text fontSize="15px" color="#4B5563" maxW="400px" lineHeight="1.7">
          Your move has been booked successfully. We will match you
          with a verified driver shortly.
        </Text>

        {jobId && (
          <Box bg="#F9FAFB" px={5} py={3} borderRadius="8px">
            <Text fontSize="14px" color="#6B7280">
              Booking reference
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
