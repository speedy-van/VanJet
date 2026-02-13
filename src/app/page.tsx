"use client";

import {
  Box,
  Text,
  VStack,
  Stack,
  Input,
  Button,
  Container,
  HStack,
  Flex,
  SimpleGrid,
} from "@chakra-ui/react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ServiceCards } from "@/components/ServiceCards";
import { HowItWorks } from "@/components/HowItWorks";
import { RecentMoves } from "@/components/RecentMoves";
import { PricingBanner } from "@/components/PricingBanner";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <Box>
      <Navbar />

      {/* ── Hero Section — Trust Blue ────────────────────────── */}
      <Box
        bg="#1D4ED8"
        color="white"
        py={{ base: 16, md: 28 }}
        px={{ base: 4, md: 8 }}
      >
        <Container maxW="1280px">
          <VStack gap={{ base: 5, md: 8 }} textAlign="center">
            <Text
              fontSize={{ base: "2.5rem", md: "3.5rem", lg: "4rem" }}
              fontWeight="800"
              lineHeight="1.08"
              letterSpacing="-0.02em"
            >
              Move anything,
              <br />
              anywhere in the UK
            </Text>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              opacity={0.9}
              maxW="580px"
              lineHeight="1.7"
            >
              Get instant quotes from verified drivers and removal companies.
              House moves, single items, office relocations and more.
            </Text>

            {/* Quick Quote Box */}
            <Box
              bg="white"
              borderRadius="12px"
              p={{ base: 5, md: 7 }}
              w="100%"
              maxW="640px"
              shadow="0 8px 32px rgba(0,0,0,0.18)"
            >
              <VStack gap={4}>
                <Stack
                  direction={{ base: "column", md: "row" }}
                  w="100%"
                  gap={3}
                >
                  <Input
                    placeholder="Pickup postcode or address"
                    size="lg"
                    bg="#F9FAFB"
                    color="#111827"
                    _placeholder={{ color: "#9CA3AF" }}
                    borderColor="#E5E7EB"
                    borderRadius="8px"
                    fontSize="15px"
                    h="48px"
                  />
                  <Input
                    placeholder="Delivery postcode or address"
                    size="lg"
                    bg="#F9FAFB"
                    color="#111827"
                    _placeholder={{ color: "#9CA3AF" }}
                    borderColor="#E5E7EB"
                    borderRadius="8px"
                    fontSize="15px"
                    h="48px"
                  />
                </Stack>
                <Link href="/book" style={{ width: "100%" }}>
                  <Button
                    w="100%"
                    size="lg"
                    bg="#F59E0B"
                    color="#111827"
                    fontWeight="700"
                    fontSize="16px"
                    h="52px"
                    borderRadius="8px"
                    _hover={{ bg: "#D97706" }}
                    _active={{ bg: "#B45309" }}
                  >
                    Get Instant Quote →
                  </Button>
                </Link>
              </VStack>
            </Box>

            {/* Social proof stats */}
            <HStack
              gap={{ base: 6, md: 10 }}
              mt={{ base: 4, md: 6 }}
              flexWrap="wrap"
              justify="center"
            >
              <VStack gap={0}>
                <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800">
                  10,000+
                </Text>
                <Text fontSize="sm" opacity={0.8}>
                  Moves completed
                </Text>
              </VStack>
              <VStack gap={0}>
                <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800">
                  4.8★
                </Text>
                <Text fontSize="sm" opacity={0.8}>
                  Average rating
                </Text>
              </VStack>
              <VStack gap={0}>
                <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800">
                  500+
                </Text>
                <Text fontSize="sm" opacity={0.8}>
                  Verified drivers
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* ── Page Sections ────────────────────────────────────── */}
      <ServiceCards />
      <HowItWorks />
      <RecentMoves />
      <PricingBanner />
      <Footer />
    </Box>
  );
}
