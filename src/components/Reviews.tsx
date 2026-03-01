"use client";

import { Box, Text, VStack, HStack, Badge, Heading } from "@chakra-ui/react";
import Link from "next/link";
import { BlurIn, StaggerParent, StaggerChild } from "@/components/animations/Motion";
import { STATIC_REVIEWS, REVIEWS_SUMMARY } from "@/lib/reviews/static-data";

export interface ReviewDisplayItem {
  id: string;
  name: string;
  location: string | null;
  rating: number;
  date: string;
  text: string;
}

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

interface ReviewsProps {
  /** When provided (e.g. from server), show these instead of static data. */
  initialReviews?: ReviewDisplayItem[];
}

export function Reviews({ initialReviews }: ReviewsProps) {
  const list = initialReviews?.length ? initialReviews : STATIC_REVIEWS;
  const summary =
    initialReviews?.length && initialReviews.length > 0
      ? `Rated ${(initialReviews.reduce((a, r) => a + r.rating, 0) / initialReviews.length).toFixed(1)} out of 5 based on ${initialReviews.length} reviews`
      : REVIEWS_SUMMARY;

  return (
    <Box bg="#F9FAFB" py={{ base: 12, md: 24 }} px={{ base: 4, md: 8 }}>
      <BlurIn>
        <VStack gap={3} mb={{ base: 8, md: 12 }}>
          <Heading
            as="h2"
            fontSize={{ base: "1.75rem", md: "2.25rem" }}
            fontWeight="800"
            textAlign="center"
            color="#111827"
            letterSpacing="-0.01em"
          >
            What Our Customers Say
          </Heading>
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
        {list.map((review) => (
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
                &quot;{review.text}&quot;
              </Text>
              <Box>
                <Text fontWeight="700" fontSize="15px" color="#111827">
                  {review.name}
                </Text>
                <HStack gap={2} fontSize="13px">
                  <Text color="#6B7280">{review.location ?? "UK"}</Text>
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
          ★ {summary}
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
