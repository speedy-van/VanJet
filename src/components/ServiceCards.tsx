"use client";

import { Box, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
}

const services: Service[] = [
  {
    id: "house_move",
    title: "House Removals",
    description:
      "Full house moves with professional loading, transport and unloading across the UK.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "office_move",
    title: "Office Relocations",
    description:
      "Efficient office and commercial moves with minimal downtime for your business.",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "single_item",
    title: "Single Item Delivery",
    description:
      "Need just one item moved? A sofa, wardrobe or appliance — we've got you covered.",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "storage",
    title: "Storage & Collection",
    description:
      "Secure collection and delivery to storage facilities anywhere in the UK.",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "packing",
    title: "Packing Services",
    description:
      "Professional packing and wrapping to keep your belongings safe during transit.",
    image:
      "https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "piano_specialist",
    title: "Specialist Items",
    description:
      "Pianos, antiques, gym equipment and other items that need specialist handling.",
    image:
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=800&q=80",
  },
];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

export function ServiceCards() {
  return (
    <Box py={{ base: 12, md: 24 }} px={{ base: 4, md: 8 }}>
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <VStack gap={3} mb={{ base: 8, md: 12 }}>
          <Text
            fontSize={{ base: "1.75rem", md: "2.25rem" }}
            fontWeight="800"
            textAlign="center"
            color="#111827"
            letterSpacing="-0.01em"
          >
            Our Services
          </Text>
          <Text
            color="#6B7280"
            textAlign="center"
            maxW="580px"
            fontSize={{ base: "15px", md: "16px" }}
            lineHeight="1.7"
          >
            Whatever you need moved, VanJet connects you with trusted drivers
            and removal companies across the UK.
          </Text>
        </VStack>
      </motion.div>

      {/* Card grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 360px), 1fr))",
          gap: "1.5rem",
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        {services.map((s) => (
          <motion.div key={s.id} variants={cardVariants}>
            <Link href="/book" style={{ display: "block" }}>
              <Box
                role="group"
                aria-label={s.title}
                position="relative"
                minH="380px"
                borderRadius="2xl"
                overflow="hidden"
                border="1px solid rgba(0,153,255,0.35)"
                boxShadow="0 0 0 1px rgba(0,153,255,0.35), 0 0 30px rgba(0,153,255,0.18)"
                cursor="pointer"
                transition="all 0.25s ease"
                _hover={{
                  transform: "translateY(-4px) scale(1.02)",
                  boxShadow:
                    "0 0 0 1px rgba(0,153,255,0.5), 0 0 50px rgba(0,153,255,0.3), 0 20px 40px rgba(0,0,0,0.25)",
                }}
              >
                {/* Background image */}
                <Box
                  position="absolute"
                  inset={0}
                  backgroundImage={`url(${s.image})`}
                  backgroundSize="cover"
                  backgroundPosition="center"
                  transition="transform 0.4s ease"
                  _groupHover={{ transform: "scale(1.06)" }}
                />

                {/* Dark gradient overlay */}
                <Box
                  position="absolute"
                  inset={0}
                  bg="linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.2))"
                />

                {/* Content */}
                <Box
                  position="relative"
                  h="full"
                  minH="380px"
                  display="flex"
                  flexDirection="column"
                  justifyContent="flex-end"
                  p={{ base: 6, md: 7 }}
                >
                  <Text
                    fontSize={{ base: "2xl", md: "3xl" }}
                    fontWeight="800"
                    color="white"
                    mb={2}
                    maxW="75%"
                    lineHeight="1.15"
                  >
                    {s.title}
                  </Text>

                  <Text
                    fontSize={{ base: "14px", md: "15px" }}
                    color="white"
                    opacity={0.9}
                    lineHeight="1.6"
                    maxW="75%"
                    mb={4}
                  >
                    {s.description}
                  </Text>

                  <Text
                    fontSize="15px"
                    fontWeight="600"
                    color="white"
                    display="inline-block"
                    width="fit-content"
                    borderBottom="2px solid transparent"
                    transition="border-color 0.25s ease"
                    _groupHover={{ borderColor: "#F59E0B" }}
                  >
                    Get Quotes &rarr;
                  </Text>
                </Box>
              </Box>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </Box>
  );
}
