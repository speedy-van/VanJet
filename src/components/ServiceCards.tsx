"use client";

import { Box, SimpleGrid, Text, VStack, Flex } from "@chakra-ui/react";

interface ServiceCard {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const services: ServiceCard[] = [
  {
    id: "house_move",
    icon: "🏠",
    title: "House Removals",
    description:
      "Full house moves with professional loading, transport and unloading across the UK.",
  },
  {
    id: "office_move",
    icon: "🏢",
    title: "Office Relocations",
    description:
      "Efficient office and commercial moves with minimal downtime for your business.",
  },
  {
    id: "single_item",
    icon: "📦",
    title: "Single Item Delivery",
    description:
      "Need just one item moved? A sofa, wardrobe or appliance — we've got you covered.",
  },
  {
    id: "storage",
    icon: "🗄️",
    title: "Storage & Collection",
    description:
      "Secure collection and delivery to storage facilities anywhere in the UK.",
  },
  {
    id: "packing",
    icon: "🎁",
    title: "Packing Services",
    description:
      "Professional packing and wrapping to keep your belongings safe during transit.",
  },
  {
    id: "piano_specialist",
    icon: "🎹",
    title: "Specialist Items",
    description:
      "Pianos, antiques, gym equipment and other items that need specialist handling.",
  },
];

export function ServiceCards() {
  return (
    <Box py={{ base: 12, md: 24 }} px={{ base: 4, md: 8 }}>
      <VStack gap={3} mb={{ base: 8, md: 12 }}>
        <Text
          fontSize={{ base: "1.75rem", md: "2.25rem" }}
          fontWeight="800"
          textAlign="center"
          color="#111827"
          letterSpacing="-0.01em"
        >
          Our Services
        </Text>
        <Text
          color="#6B7280"
          textAlign="center"
          maxW="580px"
          fontSize={{ base: "15px", md: "16px" }}
          lineHeight="1.7"
        >
          Whatever you need moved, VanJet connects you with trusted drivers and
          removal companies across the UK.
        </Text>
      </VStack>

      <SimpleGrid
        columns={{ base: 1, sm: 2, lg: 3 }}
        gap={{ base: 4, md: 6 }}
        maxW="1280px"
        mx="auto"
      >
        {services.map((s) => (
          <Box
            key={s.id}
            className="vj-card"
            p={{ base: 5, md: 6 }}
            bg="white"
            borderRadius="12px"
            borderWidth="1px"
            borderColor="#E5E7EB"
            boxShadow="0 1px 3px rgba(0,0,0,0.08)"
            cursor="pointer"
          >
            {/* Icon container — 48×48, light brand tint */}
            <Flex
              w="48px"
              h="48px"
              borderRadius="12px"
              bg="#EBF1FF"
              align="center"
              justify="center"
              mb={4}
            >
              <Text fontSize="xl">{s.icon}</Text>
            </Flex>
            <Text
              fontWeight="700"
              fontSize={{ base: "1.125rem", md: "1.25rem" }}
              mb={1}
              color="#111827"
            >
              {s.title}
            </Text>
            <Text color="#6B7280" fontSize={{ base: "14px", md: "15px" }} lineHeight="1.65">
              {s.description}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
