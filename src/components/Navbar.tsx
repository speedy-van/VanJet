"use client";

import { useState, useEffect } from "react";
import { Box, Flex, Text, Button, HStack, IconButton } from "@chakra-ui/react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Services", href: "/man-and-van/london" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/book" },
  { label: "Reviews", href: "/#recent-moves" },
  { label: "Become a Driver", href: "/driver/register" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Box
        as="nav"
        position="sticky"
        top="0"
        zIndex="1000"
        bg="white"
        borderBottomWidth="1px"
        borderColor={scrolled ? "#E5E7EB" : "transparent"}
        px={{ base: 4, md: 8 }}
        py={3}
        transition="border-color 200ms ease"
      >
        <Flex maxW="1280px" mx="auto" align="center" justify="space-between">
          {/* Logo — left */}
          <Link href="/">
            <Text
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="800"
              color="#0F2D5E"
              letterSpacing="-0.02em"
            >
              Van
              <Text as="span" color="#0F172A">
                Jet
              </Text>
            </Text>
          </Link>

          {/* Centre nav — desktop only */}
          <HStack
            gap={6}
            display={{ base: "none", lg: "flex" }}
            position="absolute"
            left="50%"
            transform="translateX(-50%)"
          >
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                <Text
                  fontSize="15px"
                  fontWeight="500"
                  color="#334155"
                  _hover={{ color: "#0F2D5E" }}
                  transition="color 150ms ease"
                >
                  {link.label}
                </Text>
              </Link>
            ))}
          </HStack>

          {/* Right — CTA + mobile hamburger */}
          <HStack gap={2}>
            <Link href="/book">
              <Button
                size={{ base: "sm", md: "md" }}
                bg="#F59E0B"
                color="#111827"
                fontWeight="700"
                borderRadius="8px"
                _hover={{ bg: "#D97706" }}
              >
                Get Quote
              </Button>
            </Link>

            {/* Hamburger — mobile only */}
            <Box
              display={{ base: "flex", lg: "none" }}
              as="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              p={2}
              aria-label="Menu"
            >
              <Box w="20px">
                <Box h="2px" bg="#111827" mb="5px" borderRadius="1px" />
                <Box h="2px" bg="#111827" mb="5px" borderRadius="1px" />
                <Box h="2px" bg="#111827" borderRadius="1px" />
              </Box>
            </Box>
          </HStack>
        </Flex>
      </Box>

      {/* Mobile menu — full-screen slide-in */}
      {mobileOpen && (
        <Box
          position="fixed"
          inset="0"
          zIndex="999"
          bg="white"
          display={{ base: "flex", lg: "none" }}
          flexDirection="column"
          px={6}
          pt={20}
          pb={8}
        >
          <Box
            as="button"
            position="absolute"
            top="16px"
            right="16px"
            p={2}
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <Text fontSize="2xl" color="#111827">✕</Text>
          </Box>

          {/* Phone number — prominent */}
          <Link href="tel:+441202129746">
            <Text
              fontSize="lg"
              fontWeight="700"
              color="#1D4ED8"
              mb={8}
            >
              📞 01202 129746
            </Text>
          </Link>

          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
              <Text
                fontSize="xl"
                fontWeight="600"
                color="#111827"
                py={3}
                borderBottomWidth="1px"
                borderColor="#E5E7EB"
              >
                {link.label}
              </Text>
            </Link>
          ))}

          <Box mt={8}>
            <Link href="/book" onClick={() => setMobileOpen(false)}>
              <Button
                w="100%"
                size="lg"
                bg="#F97316"
                color="white"
                fontWeight="700"
                borderRadius="8px"
                h="52px"
                _hover={{ bg: "#EA580C" }}
              >
                Get Instant Quote →
              </Button>
            </Link>
          </Box>
        </Box>
      )}
    </>
  );
}
