"use client";

import { Box, SimpleGrid, Text, VStack, Flex } from "@chakra-ui/react";

interface RecentMove {
  id: string;
  from: string;
  to: string;
  type: string;
  items: string;
  price: string;
  date: string;
}

const recentMoves: RecentMove[] = [
  {
    id: "1",
    from: "London SE1",
    to: "Brighton BN1",
    type: "House Move",
    items: "3-bed house — 42 items",
    price: "£485",
    date: "2 hours ago",
  },
  {
    id: "2",
    from: "Manchester M1",
    to: "Liverpool L1",
    type: "Office Relocation",
    items: "Small office — 18 items",
    price: "£310",
    date: "5 hours ago",
  },
  {
    id: "3",
    from: "Birmingham B1",
    to: "Coventry CV1",
    type: "Single Item",
    items: "Upright piano",
    price: "£165",
    date: "Yesterday",
  },
  {
    id: "4",
    from: "Leeds LS1",
    to: "Sheffield S1",
    type: "Storage Collection",
    items: "12 boxes + wardrobe",
    price: "£120",
    date: "Yesterday",
  },
];

export function RecentMoves() {
  return (
    <Box id="recent-moves" py={{ base: 12, md: 24 }} px={{ base: 4, md: 8 }}>
      <VStack gap={3} mb={{ base: 8, md: 12 }}>
        <Text
          fontSize={{ base: "1.75rem", md: "2.25rem" }}
          fontWeight="800"
          textAlign="center"
          color="#111827"
          letterSpacing="-0.01em"
        >
          Recent Moves
        </Text>
        <Text
          color="#6B7280"
          textAlign="center"
          maxW="500px"
          fontSize={{ base: "15px", md: "16px" }}
          lineHeight="1.7"
        >
          See what other customers are moving across the UK.
        </Text>
      </VStack>

      <SimpleGrid
        columns={{ base: 1, sm: 2, lg: 4 }}
        gap={{ base: 4, md: 6 }}
        maxW="1280px"
        mx="auto"
      >
        {recentMoves.map((move) => (
          <Box
            key={move.id}
            className="vj-card"
            p={{ base: 5, md: 6 }}
            bg="white"
            borderRadius="12px"
            borderWidth="1px"
            borderColor="#E5E7EB"
            boxShadow="0 1px 3px rgba(0,0,0,0.08)"
          >
            {/* Price — first, biggest, boldest */}
            <Text
              fontSize={{ base: "1.5rem", md: "1.75rem" }}
              fontWeight="800"
              color="#1D4ED8"
              mb={2}
            >
              {move.price}
            </Text>
            <Flex
              display="inline-flex"
              bg="#EBF1FF"
              color="#1D4ED8"
              borderRadius="999px"
              px={3}
              py={0.5}
              fontSize="12px"
              fontWeight="600"
              mb={3}
            >
              {move.type}
            </Flex>
            <Text fontWeight="600" fontSize="15px" mb={1} color="#111827">
              {move.from} → {move.to}
            </Text>
            <Text color="#6B7280" fontSize="14px" mb={2}>
              {move.items}
            </Text>
            <Text color="#9CA3AF" fontSize="13px">
              {move.date}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
