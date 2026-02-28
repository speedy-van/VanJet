// ─── VanJet · Reviews Page ────────────────────────────────────
// Full-page customer reviews. Uses DB when available, else static fallback.

import type { Metadata } from "next";
import Link from "next/link";
import { Box, Text, VStack, HStack, Badge, Container } from "@chakra-ui/react";
import { SITE } from "@/lib/seo/site";
import { getPublicReviews } from "@/lib/reviews/queries";
import { STATIC_REVIEWS, REVIEWS_SUMMARY } from "@/lib/reviews/static-data";

export const metadata: Metadata = {
  title: "Customer Reviews — VanJet",
  description:
    "Read what our customers say about VanJet. Real reviews from people who booked man and van, house removals and furniture delivery across the UK.",
  alternates: { canonical: "/reviews" },
  openGraph: {
    title: "Customer Reviews — VanJet",
    description:
      "Real customer reviews for VanJet removal and man and van services across the UK.",
    url: `${SITE.baseUrl}/reviews`,
    siteName: SITE.name,
    type: "website",
  },
};

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

export default async function ReviewsPage() {
  const dbReviews = await getPublicReviews(50);
  const list = dbReviews.length > 0 ? dbReviews : STATIC_REVIEWS;
  const summary =
    dbReviews.length > 0
      ? `Rated ${(dbReviews.reduce((a, r) => a + r.rating, 0) / dbReviews.length).toFixed(1)} out of 5 based on ${dbReviews.length} reviews`
      : REVIEWS_SUMMARY;

  return (
    <Box bg="#F9FAFB" minH="100vh" py={{ base: 8, md: 12 }} px={{ base: 4, md: 6 }}>
      <Container maxW="1280px">
        <VStack align="stretch" gap={6} mb={10}>
          <Link
            href="/"
            style={{ fontSize: "14px", color: "#6B7280", fontWeight: 500 }}
          >
            ← Back to home
          </Link>
          <VStack gap={2}>
            <Text
              fontSize={{ base: "1.75rem", md: "2.25rem" }}
              fontWeight="800"
              textAlign="center"
              color="#111827"
              letterSpacing="-0.01em"
            >
              What Our Customers Say
            </Text>
            <Text color="#6B7280" textAlign="center" maxW="500px" fontSize="15px">
              Trusted by over 1,200 customers across the UK
            </Text>
            <Text fontSize="15px" color="#111827" fontWeight="600">
              ★ {summary}
            </Text>
          </VStack>
        </VStack>

        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fill, minmax(min(100%, 340px), 1fr))"
          gap={6}
        >
          {list.map((review) => (
            <Box
              key={review.id}
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
          ))}
        </Box>

        <VStack mt={12} gap={4}>
          <Text fontSize="15px" color="#6B7280">
            Have you used VanJet? We&apos;d love to hear from you.
          </Text>
          <Link
            href="/book"
            style={{
              fontSize: "15px",
              color: "#1D4ED8",
              fontWeight: 600,
            }}
            className="hover:underline"
          >
            Book a move →
          </Link>
        </VStack>
      </Container>
    </Box>
  );
}
