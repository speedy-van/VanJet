"use client";

import { Box, Text, VStack, Button, Table } from "@chakra-ui/react";
import Link from "next/link";
import { BlurIn } from "@/components/animations/Motion";

const pricingData = [
  { moveType: "Single item / small load", avgPrice: "£25 – £65", duration: "1–2 hours" },
  { moveType: "Studio flat", avgPrice: "£120 – £220", duration: "2–4 hours" },
  { moveType: "1 bedroom flat", avgPrice: "£200 – £360", duration: "3–5 hours" },
  { moveType: "2 bedroom flat", avgPrice: "£320 – £530", duration: "4–7 hours" },
  { moveType: "3 bedroom house", avgPrice: "£480 – £760", duration: "6–9 hours" },
  { moveType: "4+ bedroom house", avgPrice: "£700 – £1,200+", duration: "Full day+" },
];

export function PricingTable() {
  return (
    <Box py={{ base: 12, md: 24 }} px={{ base: 4, md: 8 }}>
      <BlurIn>
        <VStack gap={3} mb={{ base: 8, md: 12 }}>
          <Text
            fontSize={{ base: "1.75rem", md: "2.25rem" }}
            fontWeight="800"
            textAlign="center"
            color="#111827"
            letterSpacing="-0.01em"
          >
            Transparent Pricing
          </Text>
          <Text
            color="#6B7280"
            textAlign="center"
            maxW="600px"
            fontSize={{ base: "15px", md: "16px" }}
            lineHeight="1.7"
          >
            Average costs for common moves across the UK. No hidden fees — ever.
          </Text>
        </VStack>
      </BlurIn>

      <Box
        maxW="900px"
        mx="auto"
        borderRadius="12px"
        borderWidth="1px"
        borderColor="#E5E7EB"
        overflow="hidden"
        boxShadow="0 1px 3px rgba(0,0,0,0.08)"
      >
        <Box overflowX="auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#1D4ED8" }}>
                <th style={{
                  padding: "16px",
                  textAlign: "left",
                  color: "white",
                  fontWeight: "700",
                  fontSize: "15px",
                }}>
                  Move Type
                </th>
                <th style={{
                  padding: "16px",
                  textAlign: "left",
                  color: "white",
                  fontWeight: "700",
                  fontSize: "15px",
                }}>
                  Average Price
                </th>
                <th style={{
                  padding: "16px",
                  textAlign: "left",
                  color: "white",
                  fontWeight: "700",
                  fontSize: "15px",
                }}>
                  Typical Duration
                </th>
              </tr>
            </thead>
            <tbody>
              {pricingData.map((row, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 0 ? "white" : "#F9FAFB",
                  }}
                >
                  <td style={{
                    padding: "16px",
                    borderBottom: index === pricingData.length - 1 ? "none" : "1px solid #E5E7EB",
                    fontWeight: "600",
                    fontSize: "15px",
                    color: "#374151",
                  }}>
                    {row.moveType}
                  </td>
                  <td style={{
                    padding: "16px",
                    borderBottom: index === pricingData.length - 1 ? "none" : "1px solid #E5E7EB",
                    fontWeight: "700",
                    fontSize: "15px",
                    color: "#1D4ED8",
                  }}>
                    {row.avgPrice}
                  </td>
                  <td style={{
                    padding: "16px",
                    borderBottom: index === pricingData.length - 1 ? "none" : "1px solid #E5E7EB",
                    fontSize: "14px",
                    color: "#6B7280",
                  }}>
                    {row.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>

      <VStack gap={4} mt={6}>
        <Text
          fontSize="12px"
          color="#9CA3AF"
          textAlign="center"
          maxW="700px"
          lineHeight="1.6"
        >
          * Prices are estimates. Your actual quote may vary based on distance,
          access requirements, and any additional services.
        </Text>
        <Link href="/book">
          <Button
            size="lg"
            bg="#F59E0B"
            color="#111827"
            fontWeight="800"
            borderRadius="8px"
            px={8}
            h="52px"
            _hover={{ bg: "#D97706", transform: "scale(1.02)" }}
          >
            Get Your Exact Quote — Free →
          </Button>
        </Link>
      </VStack>
    </Box>
  );
}
