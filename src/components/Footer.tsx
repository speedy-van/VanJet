"use client";

import { Box, Text, VStack, SimpleGrid } from "@chakra-ui/react";
import Link from "next/link";

export function Footer() {
  return (
    <Box bg="#111827" color="#9CA3AF" px={{ base: 4, md: 8 }} py={{ base: 10, md: 14 }}>
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
            Van<Text as="span" color="#F59E0B">Jet</Text>
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
          <Link href="tel:+4402012345678">
            <Text fontSize="14px" _hover={{ color: "white" }} transition="color 150ms">
              📞 020 1234 5678
            </Text>
          </Link>
          <Link href="mailto:hello@van-jet.com">
            <Text fontSize="14px" _hover={{ color: "white" }} transition="color 150ms">
              ✉️ hello@van-jet.com
            </Text>
          </Link>
          <Text fontSize="14px">London, United Kingdom</Text>
        </VStack>
      </SimpleGrid>

      <Box borderTopWidth="1px" borderColor="#374151" pt={5}>
        <Text textAlign="center" fontSize="13px" color="#6B7280">
          &copy; {new Date().getFullYear()} VanJet Ltd. All rights reserved. Registered in England &amp; Wales.
        </Text>
      </Box>
    </Box>
  );
}
