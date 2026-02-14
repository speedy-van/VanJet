"use client";

import { Box, SimpleGrid, Text, VStack, Flex } from "@chakra-ui/react";
import { BlurIn, StaggerParent, StaggerChild } from "@/components/animations/Motion";

interface RecentMove {
  id: string;
  from: string;
  to: string;
  type: string;
  items: string;
  price: string;
  timestamp: number; // milliseconds since event
}

// Helper function for relative time
function getRelativeTime(msAgo: number): string {
  const minutes = Math.floor(msAgo / 60000);
  const hours = Math.floor(msAgo / 3600000);
  const days = Math.floor(msAgo / 86400000);
  
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (hours < 48) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  
  // For older dates, show formatted date
  const date = new Date(Date.now() - msAgo);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

const recentMoves: RecentMove[] = [
  {
    id: "1",
    from: "London SE1",
    to: "Brighton BN1",
    type: "House Move",
    items: "3-bed house — 42 items",
    price: "£485",
    timestamp: 2 * 3600000, // 2 hours ago
  },
  {
    id: "2",
    from: "Manchester M1",
    to: "Liverpool L1",
    type: "Office Relocation",
    items: "Small office — 18 items",
    price: "£310",
    timestamp: 5 * 3600000, // 5 hours ago
  },
  {
    id: "3",
    from: "Birmingham B1",
    to: "Coventry CV1",
    type: "Single Item",
    items: "Upright piano",
    price: "£165",
    timestamp: 22 * 3600000, // 22 hours ago
  },
  {
    id: "4",
    from: "Leeds LS1",
    to: "Sheffield S1",
    type: "Storage Collection",
    items: "12 boxes + wardrobe",
    price: "£120",
    timestamp: 26 * 3600000, // 26 hours ago
  },
];

export function RecentMoves() {
  return (
    <Box id="recent-moves" py={{ base: 12, md: 24 }} px={{ base: 4, md: 8 }}>
      <BlurIn>
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
      </BlurIn>

      <StaggerParent
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: "1.5rem", maxWidth: "1280px", margin: "0 auto" }}
      >
        {recentMoves.map((move) => (
          <StaggerChild key={move.id}>
            <Box
              className="vj-card"
              p={{ base: 5, md: 6 }}
              bg="white"
              borderRadius="12px"
              borderWidth="1px"
              borderColor="#E5E7EB"
              boxShadow="0 1px 3px rgba(0,0,0,0.08)"
              transition="box-shadow 0.25s, transform 0.25s"
              _hover={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12)", transform: "translateY(-4px)" }}
            >
            {/* Price — first, biggest, boldest */}
            <Text
              fontSize="2xl"
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
            <Text color="#9CA3AF" fontSize="13px" suppressHydrationWarning>
              {getRelativeTime(move.timestamp)}
            </Text>
          </Box>
          </StaggerChild>
        ))}
      </StaggerParent>
    </Box>
  );
}
