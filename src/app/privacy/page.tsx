// ─── VanJet · Privacy Policy Page ──────────────────────────────
// Static legal content. English only.

import type { Metadata } from "next";
import Link from "next/link";
import { Box, Text, VStack } from "@chakra-ui/react";
import { SITE } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Privacy Policy — VanJet",
  description:
    "VanJet privacy policy. How we collect, use and protect your personal data when you use our removal and man and van booking services.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy — VanJet",
    url: `${SITE.baseUrl}/privacy`,
    siteName: SITE.name,
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <Box bg="#F9FAFB" minH="100vh" py={{ base: 8, md: 12 }} px={{ base: 4, md: 6 }}>
      <Box maxW="720px" mx="auto">
        <Link
          href="/"
          style={{ fontSize: "14px", color: "#6B7280", fontWeight: 500 }}
        >
          ← Back to home
        </Link>

        <VStack align="stretch" gap={8} mt={8}>
          <VStack align="stretch" gap={2}>
            <Text fontSize={{ base: "1.75rem", md: "2rem" }} fontWeight="800" color="#111827">
              Privacy Policy
            </Text>
            <Text color="#6B7280" fontSize="14px">
              Last updated: February 2026
            </Text>
          </VStack>

          <Box as="article">
            <VStack align="stretch" gap={6} textAlign="left">
              <Section title="1. Who we are">
                VanJet ({SITE.name}) operates a marketplace connecting customers with verified van drivers for removals and deliveries across the UK. Our contact email is {SITE.email} and our phone number is {SITE.phone}.
              </Section>

              <Section title="2. Data we collect">
                We collect information you provide when booking (name, email, phone, addresses, move date, and item details), when you register as a driver or admin, and when you contact us. We also collect technical data such as IP address and browser type when you use our website.
              </Section>

              <Section title="3. How we use your data">
                We use your data to process bookings, match you with drivers, send confirmations and updates, process payments via Stripe, improve our services, and comply with legal obligations. We do not sell your personal data to third parties.
              </Section>

              <Section title="4. Cookies and similar technologies">
                We use essential cookies to keep you signed in and to remember your preferences. We may use analytics to understand how the site is used. You can control non-essential cookies via your browser settings.
              </Section>

              <Section title="5. Data sharing">
                We share data with: drivers and customers as needed to fulfil a booking; Stripe for payments; Mapbox for address and distance; Resend for emails; and any service that helps us run the platform (e.g. hosting). We require these parties to protect your data.
              </Section>

              <Section title="6. Your rights">
                Under UK GDPR you have the right to access, correct, delete, or restrict use of your personal data, and to object to processing. To exercise these rights or ask questions, contact us at {SITE.email}.
              </Section>

              <Section title="7. Data retention">
                We keep booking and account data for as long as needed to provide the service and to meet legal, tax, or regulatory requirements. You can request deletion of your account and associated data by contacting us.
              </Section>

              <Section title="8. Changes">
                We may update this policy from time to time. We will post the updated policy on this page and, where appropriate, notify you by email.
              </Section>

              <Section title="9. Contact">
                For privacy enquiries or to exercise your rights, contact us at {SITE.email} or call {SITE.phone}.
              </Section>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <VStack align="stretch" gap={2}>
      <Text fontSize="18px" fontWeight="700" color="#111827">
        {title}
      </Text>
      <Text fontSize="15px" color="#374151" lineHeight="1.75">
        {children}
      </Text>
    </VStack>
  );
}
