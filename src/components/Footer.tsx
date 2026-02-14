"use client";

import { Box, Text, VStack, SimpleGrid, HStack } from "@chakra-ui/react";
import Link from "next/link";

export function Footer() {
  return (
    <Box bg="#0F172A" color="#94A3B8" px={{ base: 4, md: 8 }} py={{ base: 10, md: 14 }}>
      <SimpleGrid
        columns={{ base: 1, md: 4 }}
        gap={{ base: 8, md: 10 }}
        maxW="1280px"
        mx="auto"
        mb={10}
      >
        {/* Brand */}
        <VStack align={{ base: "center", md: "flex-start" }} gap={3}>
          <Text fontSize="xl" fontWeight="800" color="white">
            Van<Text as="span" color="#F97316">Jet</Text>
          </Text>
          <Text fontSize="14px" lineHeight="1.65">
            The UK&apos;s smartest removal &amp; delivery marketplace.
            Compare quotes from verified drivers in seconds.
          </Text>
        </VStack>

        {/* Services */}
        <VStack align={{ base: "center", md: "flex-start" }} gap={2}>
          <Text fontWeight="600" color="white" fontSize="15px" mb={1}>
            Services
          </Text>
          <Link href="/man-and-van/london"><Text fontSize="14px" _hover={{ color: "white" }} transition="color 150ms">Man &amp; Van</Text></Link>
          <Link href="/house-removals/london"><Text fontSize="14px" _hover={{ color: "white" }} transition="color 150ms">House Removals</Text></Link>
          <Link href="/furniture-delivery/london"><Text fontSize="14px" _hover={{ color: "white" }} transition="color 150ms">Furniture Delivery</Text></Link>
          <Link href="/office-removals/london"><Text fontSize="14px" _hover={{ color: "white" }} transition="color 150ms">Office Removals</Text></Link>
        </VStack>

        {/* Company */}
        <VStack align={{ base: "center", md: "flex-start" }} gap={2}>
          <Text fontWeight="600" color="white" fontSize="15px" mb={1}>
            Company
          </Text>
          <Link href="/blog"><Text fontSize="14px" _hover={{ color: "white" }} transition="color 150ms">Blog</Text></Link>
          <Link href="/driver/register"><Text fontSize="14px" _hover={{ color: "white" }} transition="color 150ms">Become a Driver</Text></Link>
          <Link href="/contact"><Text fontSize="14px" _hover={{ color: "white" }} transition="color 150ms">Contact Us</Text></Link>
          <Link href="/privacy"><Text fontSize="14px" _hover={{ color: "white" }} transition="color 150ms">Privacy Policy</Text></Link>
        </VStack>

        {/* Contact */}
        <VStack align={{ base: "center", md: "flex-start" }} gap={2}>
          <Text fontWeight="600" color="white" fontSize="15px" mb={1}>
            Contact
          </Text>
          <Link href="tel:+441202129746">
            <Text fontSize="14px" _hover={{ color: "white" }} transition="color 150ms" fontWeight="600">
              01202 129746
            </Text>
          </Link>
          <Link href="mailto:hello@van-jet.com">
            <Text fontSize="14px" _hover={{ color: "white" }} transition="color 150ms">
              hello@van-jet.com
            </Text>
          </Link>
          <Text fontSize="14px">United Kingdom</Text>
          <Text fontSize="13px" color="#94A3B8" mt={2}>
            We're available 7 days a week
          </Text>
        </VStack>
      </SimpleGrid>

      {/* Trust badges */}
      <Box borderTopWidth="1px" borderColor="#1E293B" pt={8} pb={6}>
        <HStack
          justify="center"
          gap={{ base: 4, md: 8 }}
          flexWrap="wrap"
          maxW="800px"
          mx="auto"
        >
          <Box
            px={4}
            py={2}
            borderRadius="md"
            bg="rgba(255, 255, 255, 0.05)"
            border="1px solid rgba(255, 255, 255, 0.1)"
          >
            <Text fontSize="13px" fontWeight="600" color="#94A3B8">
              🔒 SSL Secure
            </Text>
          </Box>
          <Box
            px={4}
            py={2}
            borderRadius="md"
            bg="rgba(255, 255, 255, 0.05)"
            border="1px solid rgba(255, 255, 255, 0.1)"
          >
            <Text fontSize="13px" fontWeight="600" color="#94A3B8">
              ✓ Companies House Registered
            </Text>
          </Box>
          <Box
            px={4}
            py={2}
            borderRadius="md"
            bg="rgba(255, 255, 255, 0.05)"
            border="1px solid rgba(255, 255, 255, 0.1)"
          >
            <Text fontSize="13px" fontWeight="600" color="#94A3B8">
              ⭐ Verified by Stripe
            </Text>
          </Box>
        </HStack>
      </Box>

      <Box borderTopWidth="1px" borderColor="#1E293B" pt={5}>
        <Text textAlign="center" fontSize="13px" color="#64748B">
          &copy; {new Date().getFullYear()} VanJet Ltd. All rights reserved. Registered in England &amp; Wales | ICO Registered Data Controller
        </Text>
      </Box>
    </Box>
  );
}
