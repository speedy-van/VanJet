"use client";

import { Box, SimpleGrid, Text, VStack, HStack, Badge } from "@chakra-ui/react";
import Link from "next/link";
import { BlurIn, StaggerParent, StaggerChild } from "@/components/animations/Motion";

interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  text: string;
}

const reviews: Review[] = [
  {
    id: "1",
    name: "Sarah T.",
    location: "London",
    rating: 5,
    date: "January 2025",
    text: "Booked a man and van last minute and the whole process took under 2 minutes. Driver arrived on time and was incredibly careful with my furniture. Would absolutely use again.",
  },
  {
    id: "2",
    name: "James R.",
    location: "Manchester",
    rating: 5,
    date: "February 2025",
    text: "Moved my 2-bed flat from Manchester to Leeds. Got 3 quotes instantly and chose the best one. Saved nearly £120 compared to the first removal company I called.",
  },
  {
    id: "3",
    name: "Emma K.",
    location: "Bristol",
    rating: 4,
    date: "February 2025",
    text: "Really smooth experience from start to finish. The price calculator was accurate and there were zero hidden charges. The driver was professional and friendly.",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <HStack gap={0.5}>
      {Array.from({ length: 5 }, (_, i) => (
        <Text
          key={i}
          color={i < rating ? "#F59E0B" : "#E5E7EB"}
          fontSize="18px"
        >
          ★
        </Text>
      ))}
    </HStack>
  );
}

export function Reviews() {
  return (
    <Box bg="#F9FAFB" py={{ base: 12, md: 24 }} px={{ base: 4, md: 8 }}>
      <BlurIn>
        <VStack gap={3} mb={{ base: 8, md: 12 }}>
          <Text
            fontSize={{ base: "1.75rem", md: "2.25rem" }}
            fontWeight="800"
            textAlign="center"
            color="#111827"
            letterSpacing="-0.01em"
          >
            What Our Customers Say
          </Text>
          <Text
            color="#6B7280"
            textAlign="center"
            maxW="500px"
            fontSize={{ base: "15px", md: "16px" }}
            lineHeight="1.7"
          >
            Trusted by over 1,200 customers across the UK
          </Text>
        </VStack>
      </BlurIn>

      <StaggerParent
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
          gap: "1.5rem",
          maxWidth: "1280px",
          margin: "0 auto 3rem",
        }}
      >
        {reviews.map((review) => (
          <StaggerChild key={review.id}>
            <Box
              bg="white"
              borderRadius="12px"
              borderWidth="1px"
              borderColor="#E5E7EB"
              p={6}
              h="full"
              display="flex"
              flexDirection="column"
            >
              <HStack justify="space-between" mb={3}>
                <StarRating rating={review.rating} />
                <Badge
                  bg="#ECFDF5"
                  color="#059669"
                  fontSize="11px"
                  fontWeight="600"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                >
                  ✓ Verified Customer
                </Badge>
              </HStack>
              <Text
                fontSize="15px"
                color="#374151"
                lineHeight="1.7"
                mb={4}
                flex={1}
              >
                "{review.text}"
              </Text>
              <Box>
                <Text fontWeight="700" fontSize="15px" color="#111827">
                  {review.name}
                </Text>
                <HStack gap={2} fontSize="13px">
                  <Text color="#6B7280">{review.location}</Text>
                  <Text color="#9CA3AF">·</Text>
                  <Text color="#9CA3AF">{review.date}</Text>
                </HStack>
              </Box>
            </Box>
          </StaggerChild>
        ))}
      </StaggerParent>

      <VStack gap={2}>
        <Text fontSize="15px" color="#111827" fontWeight="600">
          ★ Rated 4.8 out of 5 based on 312 reviews
        </Text>
        <Link href="/reviews">
          <Text
            fontSize="15px"
            color="#1D4ED8"
            fontWeight="600"
            _hover={{ textDecoration: "underline" }}
          >
            Read all reviews →
          </Text>
        </Link>
      </VStack>
    </Box>
  );
}
