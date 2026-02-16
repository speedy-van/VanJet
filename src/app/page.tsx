"use client";

import {
  Box,
  Text,
  VStack,
  Stack,
  Input,
  Button,
  Container,
  HStack,
  Flex,
} from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ServiceCards } from "@/components/ServiceCards";
import { HowItWorks } from "@/components/HowItWorks";
import { RecentMoves } from "@/components/RecentMoves";
import { Reviews } from "@/components/Reviews";
import { PricingTable } from "@/components/PricingTable";
import { PricingBanner } from "@/components/PricingBanner";
import { Footer } from "@/components/Footer";
import { SpringHover } from "@/components/animations/Motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// CountUp hook
function useCountUp(end: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return count;
}

/* ── Hero image data ─────────────────────────────────────────── */
interface HeroImage {
  src: string;
  alt: string;
}

const HERO_IMAGES: HeroImage[] = [
  {
    src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=900&q=80",
    alt: "Professional movers loading boxes into a removal van",
  },
  {
    src: "https://images.unsplash.com/photo-1603796846097-bee99e4a601f?auto=format&fit=crop&w=600&q=80",
    alt: "Cardboard moving boxes stacked and ready for transport",
  },
  {
    src: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
    alt: "Two movers carrying furniture during a house move",
  },
];

const HERO_CHIPS = ["Verified drivers", "Live tracking", "Instant quotes"];

const NEON_BORDER = "1px solid rgba(59, 130, 246, 0.35)";
const NEON_SHADOW =
  "0 0 0 1px rgba(59, 130, 246, 0.35), 0 0 30px rgba(59, 130, 246, 0.18)";
const NEON_SHADOW_HOVER =
  "0 0 0 1px rgba(59, 130, 246, 0.5), 0 0 50px rgba(59, 130, 246, 0.3), 0 20px 40px rgba(0,0,0,0.25)";

export default function HomePage() {
  // Hero address inputs state
  const [heroPickup, setHeroPickup] = useState("");
  const [heroDelivery, setHeroDelivery] = useState("");

  // Build quote URL with addresses as query params
  const quoteUrl = `/book${heroPickup || heroDelivery ? `?pickup=${encodeURIComponent(heroPickup)}&delivery=${encodeURIComponent(heroDelivery)}` : ""}`;

  return (
    <Box pb={{ base: "80px", lg: "0" }}>
      <Navbar />

      {/* ── Hero Section — Gradient Background ────────────── */}
      <Box
        bg="linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #1D4ED8 100%)"
        color="white"
        py={{ base: 14, md: 20, lg: 24 }}
        px={{ base: 4, md: 8 }}
        overflow="hidden"
        position="relative"
      >
        {/* Subtle pattern overlay */}
        <Box
          position="absolute"
          inset={0}
          opacity={0.05}
          bgImage="radial-gradient(circle at 2px 2px, white 1px, transparent 1px)"
          bgSize="48px 48px"
          pointerEvents="none"
        />
        <Container maxW="1360px" position="relative" zIndex={1}>
          <Flex
            direction={{ base: "column", lg: "row" }}
            align={{ base: "center", lg: "center" }}
            gap={{ base: 10, lg: 14 }}
          >
            {/* ── Left Column: Text + CTA ──────────────────── */}
            <Box flex={1} textAlign={{ base: "center", lg: "left" }}>
              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                <Text
                  as="h1"
                  fontSize={{ base: "2.5rem", md: "3.25rem", lg: "3.75rem" }}
                  fontWeight="800"
                  lineHeight="1.08"
                  letterSpacing="-0.02em"
                >
                  UK&apos;s #1 Man &amp; Van
                  <br />
                  and Removal Marketplace
                </Text>
              </motion.div>

              {/* Subheading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
              >
                <Text
                  fontSize={{ base: "md", md: "lg" }}
                  opacity={0.9}
                  maxW={{ base: "580px", lg: "460px" }}
                  mx={{ base: "auto", lg: 0 }}
                  mt={5}
                  lineHeight="1.7"
                >
                  Move anything, anywhere in the UK. Get instant quotes from verified
                  drivers and removal companies. House moves, single items, office relocations.
                </Text>
              </motion.div>

              {/* Quick Quote Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
                style={{ marginTop: "2rem" }}
              >
                <Box
                  bg="rgba(255, 255, 255, 0.12)"
                  backdropFilter="blur(16px)"
                  borderRadius="12px"
                  border="1px solid rgba(255, 255, 255, 0.2)"
                  p={{ base: 5, md: 7 }}
                  w="100%"
                  maxW={{ base: "640px", lg: "100%" }}
                  mx={{ base: "auto", lg: 0 }}
                  shadow="0 8px 32px rgba(0,0,0,0.24)"
                >
                  <VStack gap={4}>
                    <Stack
                      direction={{ base: "column", md: "row" }}
                      w="100%"
                      gap={3}
                    >
                      <Input
                        placeholder="Pickup postcode or address"
                        value={heroPickup}
                        onChange={(e) => setHeroPickup(e.target.value)}
                        size="lg"
                        bg="rgba(255, 255, 255, 0.95)"
                        color="#0F172A"
                        _placeholder={{ color: "#64748B" }}
                        borderColor="rgba(255, 255, 255, 0.3)"
                        borderRadius="8px"
                        fontSize="15px"
                        h="48px"
                      />
                      <Input
                        placeholder="Delivery postcode or address"
                        value={heroDelivery}
                        onChange={(e) => setHeroDelivery(e.target.value)}
                        size="lg"
                        bg="rgba(255, 255, 255, 0.95)"
                        color="#0F172A"
                        _placeholder={{ color: "#64748B" }}
                        borderColor="rgba(255, 255, 255, 0.3)"
                        borderRadius="8px"
                        fontSize="15px"
                        h="48px"
                      />
                    </Stack>
                    <HStack gap={3} w="100%">
                      <Link href={quoteUrl} style={{ flex: 1 }}>
                        <SpringHover>
                          <Button
                            w="100%"
                            size="lg"
                            bg="#F59E0B"
                            color="#111827"
                            fontWeight="800"
                            fontSize="16px"
                            h="52px"
                            borderRadius="8px"
                            _hover={{ bg: "#D97706", transform: "scale(1.02)" }}
                          >
                            Get Instant Quote →
                          </Button>
                        </SpringHover>
                      </Link>
                      <Link href="/#how-it-works">
                        <Button
                          size="lg"
                          variant="outline"
                          border="2px solid rgba(255,255,255,0.4)"
                          color="white"
                          fontWeight="600"
                          fontSize="16px"
                          h="52px"
                          borderRadius="8px"
                          bg="transparent"
                          _hover={{ bg: "rgba(255,255,255,0.1)" }}
                        >
                          See How It Works
                        </Button>
                      </Link>
                    </HStack>
                  </VStack>
                </Box>
              </motion.div>

              {/* Trust Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.75, ease: EASE }}
              >
                <Flex
                  gap={{ base: 2, md: 4 }}
                  mt={{ base: 4, md: 5 }}
                  flexWrap="wrap"
                  justify={{ base: "center", lg: "flex-start" }}
                  align="center"
                  fontSize="14px"
                  color="rgba(255,255,255,0.75)"
                  maxW={{ base: "640px", lg: "100%" }}
                  mx={{ base: "auto", lg: 0 }}
                >
                  <Text>✅ Free quotes</Text>
                  <Text display={{ base: "none", sm: "block" }}>|</Text>
                  <Text>✅ Verified drivers</Text>
                  <Text display={{ base: "none", sm: "block" }}>|</Text>
                  <Text>✅ £50k insurance</Text>
                  <Text display={{ base: "none", sm: "block" }}>|</Text>
                  <Text>✅ 48hr cancellation</Text>
                </Flex>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9, ease: EASE }}
              >
                <HStack
                  gap={{ base: 6, md: 10 }}
                  mt={{ base: 6, md: 8 }}
                  flexWrap="wrap"
                  justify={{ base: "center", lg: "flex-start" }}
                >
                  <VStack gap={0}>
                    <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800">
                      1,200+
                    </Text>
                    <Text fontSize="sm" opacity={0.8}>
                      Moves completed
                    </Text>
                  </VStack>
                  <VStack gap={0}>
                    <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800">
                      4.8★
                    </Text>
                    <Text fontSize="sm" opacity={0.8}>
                      Average rating
                    </Text>
                  </VStack>
                  <VStack gap={0}>
                    <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800">
                      50+
                    </Text>
                    <Text fontSize="sm" opacity={0.8}>
                      Verified drivers
                    </Text>
                  </VStack>
                </HStack>
              </motion.div>
            </Box>

            {/* ── Right Column: Image Composition ──────────── */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
              style={{ flex: 1, width: "100%" }}
            >
              <Box
                display={{ base: "flex", lg: "flex" }}
                flexDirection="column"
                gap={3}
                maxW={{ base: "540px", lg: "100%" }}
                mx={{ base: "auto", lg: 0 }}
              >
                {/* Main hero image */}
                <Box
                  position="relative"
                  borderRadius="2xl"
                  overflow="hidden"
                  border={NEON_BORDER}
                  boxShadow={NEON_SHADOW}
                  transition="all 0.25s ease"
                  _hover={{
                    transform: "scale(1.02)",
                    boxShadow: NEON_SHADOW_HOVER,
                  }}
                  h={{ base: "240px", md: "300px", lg: "340px" }}
                >
                  <Image
                    src={HERO_IMAGES[0].src}
                    alt={HERO_IMAGES[0].alt}
                    fill
                    sizes="(max-width: 1024px) 540px, 600px"
                    style={{ objectFit: "cover" }}
                    priority
                  />
                  {/* Dark gradient */}
                  <Box
                    position="absolute"
                    inset={0}
                    bg="linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0.05))"
                  />
                  {/* Glass chips */}
                  <Flex
                    position="absolute"
                    top={4}
                    left={4}
                    gap={2}
                    flexWrap="wrap"
                  >
                    {HERO_CHIPS.map((chip) => (
                      <Box
                        key={chip}
                        px={3}
                        py={1}
                        borderRadius="full"
                        bg="rgba(255,255,255,0.15)"
                        backdropFilter="blur(12px)"
                        border="1px solid rgba(255,255,255,0.2)"
                        fontSize="xs"
                        fontWeight="600"
                        color="white"
                        whiteSpace="nowrap"
                      >
                        {chip}
                      </Box>
                    ))}
                  </Flex>
                </Box>

                {/* Secondary images row */}
                <Flex gap={3}>
                  {HERO_IMAGES.slice(1).map((img, i) => (
                    <Box
                      key={i}
                      position="relative"
                      flex={1}
                      borderRadius="2xl"
                      overflow="hidden"
                      border={NEON_BORDER}
                      boxShadow={NEON_SHADOW}
                      transition="all 0.25s ease"
                      _hover={{
                        transform: "scale(1.02)",
                        boxShadow: NEON_SHADOW_HOVER,
                      }}
                      h={{ base: "120px", md: "150px", lg: "165px" }}
                    >
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        sizes="(max-width: 1024px) 260px, 290px"
                        style={{ objectFit: "cover" }}
                      />
                      <Box
                        position="absolute"
                        inset={0}
                        bg="linear-gradient(to top, rgba(0,0,0,0.35), rgba(0,0,0,0.05))"
                      />
                    </Box>
                  ))}
                </Flex>
              </Box>
            </motion.div>
          </Flex>
        </Container>
      </Box>

      {/* ── Page Sections ────────────────────────────────────── */}
      <ServiceCards />
      <HowItWorks />
      <RecentMoves />
      <Reviews />
      <PricingTable />
      <PricingBanner />
      <Footer />

      {/* Mobile Sticky CTA Bar — bottom of viewport */}
      <Box
        display={{ base: "block", lg: "none" }}
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        zIndex="999"
        bg="white"
        borderTop="1px solid #E5E7EB"
        px={4}
        py={3}
        pb="calc(12px + env(safe-area-inset-bottom))"
        boxShadow="0 -4px 12px rgba(0, 0, 0, 0.08)"
      >
        <Link href="/book">
          <Button
            w="100%"
            size="lg"
            bg="#F59E0B"
            color="#111827"
            fontWeight="800"
            fontSize="16px"
            h="52px"
            borderRadius="10px"
            _hover={{ bg: "#D97706" }}
          >
            Get Free Quote →
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
