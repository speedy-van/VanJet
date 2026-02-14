"use client";

import { Box, Text, VStack, Button } from "@chakra-ui/react";
import Link from "next/link";
import { FadeUp, SpringHover } from "@/components/animations/Motion";

export function PricingBanner() {
  return (
    <Box
      py={{ base: 12, md: 24 }}
      px={{ base: 4, md: 8 }}
      bg="#F8FAFC"
    >
      <Box
        maxW="920px"
        mx="auto"
        bg="white"
        borderWidth="1px"
        borderColor="#E2E8F0"
        borderRadius="12px"
        boxShadow="0 1px 3px rgba(0, 0, 0, 0.08)"
        p={{ base: 8, md: 12 }}
        textAlign="center"
      >
        <VStack gap={5}>
          <FadeUp y={30}>
            <Text
              fontSize={{ base: "1.75rem", md: "2.25rem" }}
              fontWeight="800"
              letterSpacing="-0.01em"
              color="#111827"
            >
              Transparent, AI-Powered Pricing
            </Text>
          </FadeUp>
          <FadeUp delay={0.15} y={20}>
            <Text
              fontSize={{ base: "15px", md: "16px" }}
              color="#6B7280"
              lineHeight="1.7"
            >
              Our intelligent pricing engine analyses distance, item weight, volume
              and current demand to give you a fair estimate in seconds. No hidden
              fees, no surprises.
            </Text>
          </FadeUp>
          <FadeUp delay={0.3}>
            <Link href="/book" style={{ width: "100%", maxWidth: "300px" }}>
              <SpringHover>
                <Button
                  size="lg"
                  bg="#F59E0B"
                  color="#111827"
                  fontWeight="700"
                  borderRadius="8px"
                  h="52px"
                  _hover={{ bg: "#D97706" }}
                  _active={{ bg: "#B45309" }}
                  w="full"
                >
                  Get Instant Quote →
                </Button>
              </SpringHover>
            </Link>
          </FadeUp>
        </VStack>
      </Box>
    </Box>
  );
}
