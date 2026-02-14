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
      bg="#F9FAFB"
    >
      <BlurIn>
        <VStack gap={3} mb={{ base: 8, md: 12 }}>
          <Text
            fontSize={{ base: "1.75rem", md: "2.25rem" }}
            fontWeight="800"
            textAlign="center"
            color="#111827"
            letterSpacing="-0.01em"
          >
            How It Works
          </Text>
          <Text
            color="#6B7280"
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
      >
        {steps.map((step, i) => (
          <FadeUp key={step.number} delay={0.15 * i} y={30}>
            <VStack gap={4} textAlign="center">
              <Flex
                w="56px"
                h="56px"
                borderRadius="full"
                bg="#1D4ED8"
                color="white"
                align="center"
                justify="center"
                fontWeight="800"
                fontSize="xl"
                flexShrink={0}
              >
                {step.number}
              </Flex>
              <Text
                fontWeight="700"
                fontSize={{ base: "1.125rem", md: "1.25rem" }}
                color="#111827"
              >
                {step.title}
              </Text>
              <Text
                color="#6B7280"
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
