"use client";

// ─── VanJet · Location Page Content ──────────────────────────
// Mobile-first, English only, LTR. Chakra UI v3. No car transport.
// Trust Blue #1D4ED8 · Amber #F59E0B · Green #059669

import Link from "next/link";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  SimpleGrid,
  Flex,
} from "@chakra-ui/react";

interface LocationPageContentProps {
  serviceSlug: string;
  serviceTitle: string;
  serviceH1: string;
  serviceDescription: string;
  cityName: string;
  cityRegion: string;
  population: string;
  faqs: { question: string; answer: string }[];
}

const BENEFITS = [
  {
    icon: "⚡",
    title: "Instant Quotes",
    text: "Get a price in seconds — no waiting for callbacks.",
  },
  {
    icon: "✅",
    title: "Verified Drivers",
    text: "Every driver is ID-checked and insured for your peace of mind.",
  },
  {
    icon: "📱",
    title: "Book Online",
    text: "Book and manage your move from any device, anytime.",
  },
  {
    icon: "💷",
    title: "Transparent Pricing",
    text: "No hidden fees. See a full breakdown before you pay.",
  },
];

export function LocationPageContent({
  serviceTitle,
  serviceH1,
  serviceDescription,
  cityName,
  cityRegion,
  population,
  faqs,
}: LocationPageContentProps) {
  return (
    <Box bg="#F9FAFB" minH="100vh">
      {/* Hero */}
      <Box
        bg="#1D4ED8"
        color="white"
        py={{ base: 14, md: 24 }}
        px={{ base: 4, md: 8 }}
      >
        <Box maxW="1280px" mx="auto">
          {/* Breadcrumb */}
          <HStack gap={1} fontSize="14px" mb={5} opacity={0.85}>
            <Link href="/" style={{ textDecoration: "underline" }}>
              Home
            </Link>
            <Text>/</Text>
            <Text>{serviceTitle}</Text>
            <Text>/</Text>
            <Text fontWeight="600">{cityName}</Text>
          </HStack>

          <Text
            as="h1"
            fontSize={{ base: "2rem", md: "3rem" }}
            fontWeight="800"
            lineHeight="1.1"
            maxW="700px"
            letterSpacing="-0.02em"
          >
            {serviceH1} in {cityName}
          </Text>
          <Text
            fontSize={{ base: "15px", md: "17px" }}
            mt={4}
            maxW="600px"
            opacity={0.9}
            lineHeight="1.7"
          >
            {serviceDescription} Serving {cityName} and the wider{" "}
            {cityRegion} area — population {population}.
          </Text>

          <Flex mt={7} gap={3} direction={{ base: "column", sm: "row" }}>
            <Link href="/book">
              <Button
                size="lg"
                bg="#F59E0B"
                color="#111827"
                fontWeight="700"
                borderRadius="8px"
                h="52px"
                _hover={{ bg: "#D97706" }}
                _active={{ bg: "#B45309" }}
                width={{ base: "100%", sm: "auto" }}
                px={8}
              >
                Get Instant Quote →
              </Button>
            </Link>
            <Link href="/#how-it-works">
              <Button
                size="lg"
                variant="outline"
                borderColor="rgba(255,255,255,0.4)"
                color="white"
                fontWeight="600"
                borderRadius="8px"
                h="52px"
                _hover={{ bg: "rgba(255,255,255,0.1)" }}
                width={{ base: "100%", sm: "auto" }}
                px={8}
              >
                How It Works
              </Button>
            </Link>
          </Flex>
        </Box>
      </Box>

      {/* Main content */}
      <Box maxW="1280px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 10, md: 16 }}>
        <Flex
          direction={{ base: "column", lg: "row" }}
          gap={{ base: 10, lg: 12 }}
        >
          {/* Content column */}
          <Box flex={1}>
            {/* Benefits grid */}
            <SimpleGrid columns={{ base: 1, sm: 2 }} gap={5} mb={12}>
              {BENEFITS.map((b) => (
                <Box
                  key={b.title}
                  className="vj-card"
                  bg="white"
                  borderRadius="12px"
                  p={6}
                  boxShadow="0 1px 3px rgba(0,0,0,0.08)"
                  borderWidth="1px"
                  borderColor="#E5E7EB"
                >
                  <Flex
                    w="48px"
                    h="48px"
                    borderRadius="12px"
                    bg="#EBF1FF"
                    align="center"
                    justify="center"
                    mb={4}
                  >
                    <Text fontSize="xl">{b.icon}</Text>
                  </Flex>
                  <Text fontWeight="700" color="#111827" mb={1} fontSize="1.125rem">
                    {b.title}
                  </Text>
                  <Text fontSize="14px" color="#6B7280" lineHeight="1.65">
                    {b.text}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>

            {/* About section */}
            <Box mb={12}>
              <Text
                as="h2"
                fontSize={{ base: "1.5rem", md: "1.75rem" }}
                fontWeight="800"
                color="#111827"
                mb={4}
                letterSpacing="-0.01em"
              >
                About {serviceTitle} in {cityName}
              </Text>
              <VStack gap={4} align="stretch">
                <Text fontSize="15px" color="#4B5563" lineHeight="1.7">
                  VanJet connects you with trusted, verified{" "}
                  {serviceTitle.toLowerCase()} drivers in {cityName} and the
                  surrounding {cityRegion} area. Whether you&apos;re moving
                  across the street or across the country, our platform makes
                  it easy to compare prices, book online, and track your move
                  in real time.
                </Text>
                <Text fontSize="15px" color="#4B5563" lineHeight="1.7">
                  Every driver on VanJet is fully insured and reviewed by
                  previous customers. Our hybrid pricing engine ensures you
                  get a fair, transparent quote every time — no hidden fees,
                  no surprises.
                </Text>
              </VStack>
            </Box>

            {/* FAQ section */}
            <Box mb={12}>
              <Text
                as="h2"
                fontSize={{ base: "1.5rem", md: "1.75rem" }}
                fontWeight="800"
                color="#111827"
                mb={5}
                letterSpacing="-0.01em"
              >
                Frequently Asked Questions
              </Text>
              <VStack gap={4} align="stretch">
                {faqs.map((faq, i) => (
                  <Box
                    key={i}
                    bg="white"
                    borderRadius="12px"
                    p={5}
                    borderWidth="1px"
                    borderColor="#E5E7EB"
                    boxShadow="0 1px 3px rgba(0,0,0,0.08)"
                  >
                    <Text
                      fontWeight="700"
                      color="#111827"
                      fontSize="15px"
                      mb={2}
                    >
                      {faq.question}
                    </Text>
                    <Text fontSize="14px" color="#4B5563" lineHeight="1.65">
                      {faq.answer}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          </Box>

          {/* Sidebar */}
          <Box
            w={{ base: "100%", lg: "340px" }}
            flexShrink={0}
            position={{ lg: "sticky" }}
            top={{ lg: "80px" }}
            alignSelf={{ lg: "flex-start" }}
          >
            {/* CTA card */}
            <Box
              bg="white"
              borderRadius="12px"
              p={6}
              boxShadow="0 4px 16px rgba(0,0,0,0.1)"
              borderWidth="1px"
              borderColor="#E5E7EB"
              mb={5}
            >
              <Text fontWeight="800" color="#111827" fontSize="1.25rem" mb={2}>
                Ready to move?
              </Text>
              <Text fontSize="14px" color="#6B7280" mb={5} lineHeight="1.65">
                Get an instant quote for {serviceTitle.toLowerCase()} in{" "}
                {cityName}. No obligation, no callbacks.
              </Text>
              <Link href="/book">
                <Button
                  bg="#F59E0B"
                  color="#111827"
                  size="lg"
                  fontWeight="700"
                  borderRadius="8px"
                  width="100%"
                  h="52px"
                  _hover={{ bg: "#D97706" }}
                  _active={{ bg: "#B45309" }}
                >
                  Get Instant Quote →
                </Button>
              </Link>
            </Box>

            {/* Trust signals */}
            <Box
              bg="white"
              borderRadius="12px"
              p={5}
              boxShadow="0 1px 3px rgba(0,0,0,0.08)"
              borderWidth="1px"
              borderColor="#E5E7EB"
            >
              <Text fontWeight="700" color="#111827" fontSize="15px" mb={4}>
                Why choose VanJet?
              </Text>
              <VStack gap={3} align="stretch">
                <TrustLine text="Fully insured drivers" />
                <TrustLine text="Instant online booking" />
                <TrustLine text="Transparent pricing" />
                <TrustLine text="Real customer reviews" />
                <TrustLine text="Same-day availability" />
              </VStack>
              <HStack mt={5} gap={2}>
                <Flex
                  bg="#ECFDF5"
                  color="#059669"
                  borderRadius="999px"
                  px={3}
                  py={1}
                  fontSize="12px"
                  fontWeight="600"
                >
                  4.8 ★ average
                </Flex>
                <Flex
                  bg="#EBF1FF"
                  color="#1D4ED8"
                  borderRadius="999px"
                  px={3}
                  py={1}
                  fontSize="12px"
                  fontWeight="600"
                >
                  10,000+ moves
                </Flex>
              </HStack>
            </Box>
          </Box>
        </Flex>
      </Box>

      {/* Bottom CTA */}
      <Box bg="#1D4ED8" py={{ base: 12, md: 16 }} px={{ base: 4, md: 8 }}>
        <Box maxW="700px" mx="auto" textAlign="center">
          <Text
            as="h2"
            fontSize={{ base: "1.5rem", md: "1.75rem" }}
            fontWeight="800"
            color="white"
            mb={3}
          >
            Book Your {serviceTitle} in {cityName} Today
          </Text>
          <Text fontSize="15px" color="rgba(255,255,255,0.85)" mb={6} lineHeight="1.7">
            Join thousands of happy customers who trust VanJet for their
            removals and deliveries across the UK.
          </Text>
          <Link href="/book">
            <Button
              size="lg"
              bg="#F59E0B"
              color="#111827"
              fontWeight="700"
              borderRadius="8px"
              h="52px"
              _hover={{ bg: "#D97706" }}
              _active={{ bg: "#B45309" }}
            >
              Start Your Booking →
            </Button>
          </Link>
        </Box>
      </Box>
    </Box>
  );
}

function TrustLine({ text }: { text: string }) {
  return (
    <HStack gap={2}>
      <Text color="#059669" fontSize="14px" fontWeight="700">
        ✓
      </Text>
      <Text fontSize="14px" color="#4B5563">
        {text}
      </Text>
    </HStack>
  );
}
