// ─── VanJet · Contact Us Page ───────────────────────────────────
// Contact details and short intro. Uses SITE for consistency.

import type { Metadata } from "next";
import Link from "next/link";
import { Box, Text, VStack, HStack } from "@chakra-ui/react";
import { SITE } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Contact Us — VanJet",
  description:
    `Get in touch with VanJet. Phone ${SITE.phone}, email ${SITE.email}. Scotland's trusted man and van & removal service.`,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Us — VanJet",
    description: "Contact VanJet for removal and man and van enquiries across Scotland and the UK.",
    url: `${SITE.baseUrl}/contact`,
    siteName: SITE.name,
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <Box bg="#F9FAFB" minH="100vh" py={{ base: 8, md: 12 }} px={{ base: 4, md: 6 }}>
      <Box maxW="640px" mx="auto">
        <Link
          href="/"
          style={{ fontSize: "14px", color: "#6B7280", fontWeight: 500 }}
        >
          ← Back to home
        </Link>

        <VStack align="stretch" gap={8} mt={8}>
          <VStack align="stretch" gap={2}>
            <Text fontSize={{ base: "1.75rem", md: "2rem" }} fontWeight="800" color="#111827">
              Contact Us
            </Text>
            <Text color="#6B7280" fontSize="15px" lineHeight="1.7">
              Need help with a booking or have a question? We&apos;re here to help.
            </Text>
          </VStack>

          <Box
            bg="white"
            borderRadius="12px"
            borderWidth="1px"
            borderColor="#E5E7EB"
            p={6}
          >
            <VStack align="stretch" gap={5}>
              <Box>
                <Text fontSize="12px" color="#9CA3AF" fontWeight="600" textTransform="uppercase" letterSpacing="0.05em" mb={1}>
                  Phone
                </Text>
                <Link href={`tel:+44${SITE.phone.replace(/\s/g, "").replace(/^0/, "")}`} style={{ fontSize: "18px", fontWeight: 700, color: "#1D4ED8" }}>
                  {SITE.phone}
                </Link>
              </Box>
              <Box>
                <Text fontSize="12px" color="#9CA3AF" fontWeight="600" textTransform="uppercase" letterSpacing="0.05em" mb={1}>
                  Email
                </Text>
                <Link href={`mailto:${SITE.email}`} style={{ fontSize: "16px", fontWeight: 600, color: "#1D4ED8" }}>
                  {SITE.email}
                </Link>
              </Box>
              <Box>
                <Text fontSize="12px" color="#9CA3AF" fontWeight="600" textTransform="uppercase" letterSpacing="0.05em" mb={1}>
                  Address
                </Text>
                <Text fontSize="15px" color="#374151">
                  {SITE.address.street}<br />
                  {SITE.address.city}, {SITE.address.region}<br />
                  {SITE.address.postalCode}<br />
                  United Kingdom
                </Text>
              </Box>
            </VStack>
          </Box>

          <Text color="#6B7280" fontSize="14px">
            For instant quotes and to book a move online, use our booking wizard — no need to call.
          </Text>
          <Link
            href="/book"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              background: "#1D4ED8",
              color: "white",
              fontWeight: 600,
              borderRadius: "8px",
              fontSize: "15px",
            }}
          >
            Book a move →
          </Link>
        </VStack>
      </Box>
    </Box>
  );
}
