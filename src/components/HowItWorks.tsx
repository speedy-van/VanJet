"use client";

import { Box, SimpleGrid, Text, VStack, Flex } from "@chakra-ui/react";
import { BlurIn, FadeUp } from "@/components/animations/Motion";

const steps = [
  {
    number: "1",
    title: "Tell us what you need",
    description:
      "Enter your pickup and delivery addresses, select items you\u2019re moving, and pick a date — takes under 2 minutes.",
  },
  {
    number: "2",
    title: "Receive driver quotes",
    description:
      "Your request goes live to verified drivers in your area. They\u2019ll send competitive quotes — usually within minutes.",
  },
  {
    number: "3",
    title: "Compare, pay & relax",
    description:
      "Compare prices, ratings, and reviews side by side. Choose your driver, pay securely, and track your move in real time.",
  },
];

export function HowItWorks() {
  return (
    <Box
      id="how-it-works"
      py={{ base: 12, md: 24 }}
      px={{ base: 4, md: 8 }}
      bg="#F8FAFC"
    >
      <BlurIn>
        <VStack gap={3} mb={{ base: 8, md: 12 }}>
          <Text
            fontSize={{ base: "1.75rem", md: "2.25rem" }}
            fontWeight="800"
            textAlign="center"
            color="#0F172A"
            letterSpacing="-0.01em"
          >
            How It Works
          </Text>
          <Text
            color="#64748B"
            textAlign="center"
            maxW="500px"
            fontSize={{ base: "15px", md: "16px" }}
            lineHeight="1.7"
          >
            Three simple steps to your stress-free move.
          </Text>
        </VStack>
      </BlurIn>

      <SimpleGrid
        columns={{ base: 1, md: 3 }}
        gap={{ base: 6, md: 8 }}
        maxW="1000px"
        mx="auto"
        position="relative"
      >
        {/* Dashed connector line (desktop only) */}
        <Box
          display={{ base: "none", md: "block" }}
          position="absolute"
          top="28px"
          left="calc(16.67% + 28px)"
          right="calc(16.67% + 28px)"
          h="2px"
          borderTop="2px dashed"
          borderColor="rgba(15, 45, 94, 0.2)"
          zIndex={0}
        />

        {steps.map((step, i) => (
          <FadeUp key={step.number} delay={0.15 * i} y={30}>
            <VStack gap={4} textAlign="center" position="relative" zIndex={1}>
              <Flex
                w="56px"
                h="56px"
                borderRadius="full"
                bg="#0F2D5E"
                color="white"
                align="center"
                justify="center"
                fontWeight="800"
                fontSize="xl"
                flexShrink={0}
                border="4px solid #F8FAFC"
              >
                {step.number}
              </Flex>
              <Text
                fontWeight="700"
                fontSize={{ base: "1.125rem", md: "1.25rem" }}
                color="#0F172A"
              >
                {step.title}
              </Text>
              <Text
                color="#64748B"
                fontSize={{ base: "14px", md: "15px" }}
                lineHeight="1.65"
              >
                {step.description}
              </Text>
            </VStack>
          </FadeUp>
        ))}
      </SimpleGrid>
    </Box>
  );
}
