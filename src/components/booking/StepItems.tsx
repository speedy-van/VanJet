"use client";

// ─── VanJet · Step Items (Image Card Grid) ───────────────────
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Flex,
  Badge,
  Stack,
  SimpleGrid,
} from "@chakra-ui/react";
import type { BookingForm, CatalogItem, BookingItem } from "./types";

interface StepItemsProps {
  form: BookingForm;
  onNext: () => void;
  onBack: () => void;
}

export function StepItems({ form, onNext, onBack }: StepItemsProps) {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [error, setError] = useState("");
  const [notSure, setNotSure] = useState(false);
  const [hasLargeItems, setHasLargeItems] = useState(false);

  const items = form.watch("items");

  useEffect(() => {
    fetch("/data/items.json")
      .then((r) => r.json())
      .then(setCatalog)
      .catch(() => {});
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(catalog.map((c) => c.category));
    return Array.from(cats).sort();
  }, [catalog]);

  const filtered = useMemo(() => {
    return catalog.filter((item) => {
      if (search && !item.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (selectedCategory && item.category !== selectedCategory) return false;
      return true;
    });
  }, [catalog, search, selectedCategory]);

  // Calculate totals
  const { totalVolume, totalWeight } = useMemo(() => {
    const volume = items.reduce(
      (sum, item) => sum + item.volumeM3 * item.quantity,
      0
    );
    const weight = items.reduce(
      (sum, item) => sum + item.weightKg * item.quantity,
      0
    );
    return { totalVolume: volume, totalWeight: weight };
  }, [items]);

  // Vehicle recommendation
  const vehicleRecommendation = useMemo(() => {
    if (totalVolume < 5) return "Small Van (up to 5m³)";
    if (totalVolume < 10) return "Medium Van (5-10m³)";
    if (totalVolume < 15) return "Large Van (10-15m³)";
    return "Luton Van (15m³+)";
  }, [totalVolume]);

  const addCatalogItem = (ci: CatalogItem) => {
    const existing = items.find((i) => i.id === ci.id);
    if (existing) {
      form.setValue(
        "items",
        items.map((i) =>
          i.id === ci.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      const newItem: BookingItem = {
        id: ci.id,
        name: ci.name,
        category: ci.category,
        quantity: 1,
        weightKg: ci.weight,
        volumeM3: ci.volume,
        fragile: ci.fragility_level === "high",
        notes: "",
        isCustom: false,
      };
      form.setValue("items", [...items, newItem]);
    }
    setError("");
  };

  const addCustomItem = () => {
    if (!customName.trim()) return;
    const newItem: BookingItem = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      category: "Custom",
      quantity: 1,
      weightKg: 10,
      volumeM3: 0.1,
      fragile: false,
      notes: "",
      isCustom: true,
    };
    form.setValue("items", [...items, newItem]);
    setCustomName("");
    setShowCustom(false);
    setError("");
  };

  const updateQuantity = (id: string, delta: number) => {
    form.setValue(
      "items",
      items
        .map((i) =>
          i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    form.setValue(
      "items",
      items.filter((i) => i.id !== id)
    );
  };

  const toggleFragile = (id: string) => {
    form.setValue(
      "items",
      items.map((i) => (i.id === id ? { ...i, fragile: !i.fragile } : i))
    );
  };

  const handleNext = () => {
    if (items.length === 0 && !notSure && !hasLargeItems) {
      setError("Add at least one item or check a flexibility option to continue.");
      return;
    }
    onNext();
  };

  const getItemImage = (itemId: string): string => {
    const ci = catalog.find((c) => c.id === itemId);
    return ci?.image || "";
  };

  return (
    <Box bg="white" borderRadius="xl" shadow="sm" p={{ base: 5, md: 8 }}>
      <VStack gap={5} align="stretch">
        <Box>
          <Text fontSize="xl" fontWeight="800" color="gray.800">
            What are you moving?
          </Text>
          <Text fontSize="sm" color="gray.500">
            Browse items with photos or add custom items.
          </Text>
        </Box>

        {/* ── 2-COLUMN LAYOUT ───────────────────────────────────── */}
        <Flex gap={6} direction={{ base: "column", lg: "row" }} align="start">
          {/* ── LEFT PANEL (60%) ──────────────────────────── */}
          <Box flex={{ base: "1", lg: "3" }} w="full">
            <VStack gap={4} align="stretch">
              {error && (
                <Text fontSize="sm" color="red.500" fontWeight="600">
                  {error}
                </Text>
              )}

              {/* Search + filter */}
              <Stack direction={{ base: "column", sm: "row" }} gap={3}>
                <Input
                  placeholder="Search items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  bg="white"
                  flex={1}
                />
                <Box>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                      height: 40,
                      padding: "0 12px",
                      borderRadius: 6,
                      border: "1px solid #E2E8F0",
                      fontSize: 14,
                      minWidth: 160,
                      background: "white",
                    }}
                  >
                    <option value="">All categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </Box>
              </Stack>

              {/* Catalogue image grid */}
              <Box
                maxH="520px"
                overflowY="auto"
                borderWidth="1px"
                borderColor="gray.100"
                borderRadius="lg"
                p={3}
              >
                {filtered.length === 0 ? (
                  <Text fontSize="sm" color="gray.400" textAlign="center" py={6}>
                    No items found. Try a different search or add a custom item.
                  </Text>
                ) : (
                  <SimpleGrid columns={{ base: 2, sm: 3 }} gap={3}>
                    {filtered.map((ci) => {
                      const inCart = items.find((i) => i.id === ci.id);
                      return (
                        <Box
                          key={ci.id}
                          borderWidth="2px"
                          borderColor={inCart ? "blue.400" : "gray.100"}
                          borderRadius="lg"
                          overflow="hidden"
                          cursor="pointer"
                          bg={inCart ? "blue.50" : "white"}
                          _hover={{
                            shadow: "md",
                            borderColor: inCart ? "blue.500" : "gray.300",
                          }}
                          transition="all 0.15s"
                          onClick={() => addCatalogItem(ci)}
                          position="relative"
                        >
                          {/* Image */}
                          <Box position="relative" w="full" h="120px" bg="gray.100">
                            {ci.image ? (
                              <Image
                                src={ci.image}
                                alt={ci.name}
                                fill
                                sizes="(max-width: 640px) 50vw, 33vw"
                                style={{ objectFit: "cover" }}
                              />
                            ) : (
                              <Flex
                                align="center"
                                justify="center"
                                h="full"
                                color="gray.300"
                                fontSize="2xl"
                              >
                                📦
                              </Flex>
                            )}

                            {/* Quantity badge */}
                            {inCart && (
                              <Flex
                                position="absolute"
                                top={1}
                                right={1}
                                bg="blue.500"
                                color="white"
                                borderRadius="full"
                                w="24px"
                                h="24px"
                                align="center"
                                justify="center"
                                fontSize="xs"
                                fontWeight="700"
                                shadow="sm"
                              >
                                {inCart.quantity}
                              </Flex>
                            )}
                          </Box>

                          {/* Info */}
                          <Box px={2} py={2}>
                            <Text
                              fontSize="xs"
                              fontWeight="600"
                              color="gray.800"
                              lineClamp={2}
                              lineHeight="1.3"
                            >
                              {ci.name}
                            </Text>
                            <HStack gap={1} mt={1}>
                              <Text fontSize="2xs" color="gray.400">
                                {ci.weight}kg
                              </Text>
                              <Text fontSize="2xs" color="gray.300">
                                ·
                              </Text>
                              <Text fontSize="2xs" color="gray.400">
                                {ci.volume}m³
                              </Text>
                            </HStack>
                            {ci.fragility_level !== "Low" && (
                              <Badge
                                mt={1}
                                fontSize="2xs"
                                colorPalette="orange"
                                variant="subtle"
                              >
                                {ci.fragility_level}
                              </Badge>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </SimpleGrid>
                )}
              </Box>

              {/* Custom item */}
              {showCustom ? (
                <HStack gap={2}>
                  <Input
                    placeholder="Item name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    bg="white"
                    onKeyDown={(e) => e.key === "Enter" && addCustomItem()}
                  />
                  <Button colorPalette="blue" onClick={addCustomItem}>
                    Add
                  </Button>
                  <Button variant="ghost" onClick={() => setShowCustom(false)}>
                    Cancel
                  </Button>
                </HStack>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustom(true)}
                >
                  + Add custom item
                </Button>
              )}

              {/* Flexibility checkboxes */}
              <VStack gap={2} align="stretch" pt={2}>
                <Flex as="label" align="center" gap={2} cursor="pointer">
                  <input
                    type="checkbox"
                    checked={notSure}
                    onChange={(e) => setNotSure(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: "#1D4ED8" }}
                  />
                  <Text fontSize="sm" color="gray.700">
                    Not sure about some items?
                  </Text>
                </Flex>
                <Flex as="label" align="center" gap={2} cursor="pointer">
                  <input
                    type="checkbox"
                    checked={hasLargeItems}
                    onChange={(e) => setHasLargeItems(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: "#1D4ED8" }}
                  />
                  <Text fontSize="sm" color="gray.700">
                    I have additional large items
                  </Text>
                </Flex>
              </VStack>
            </VStack>
          </Box>

          {/* ── RIGHT PANEL (40%) - STICKY SUMMARY ──────── */}
          <Box
            flex={{ base: "1", lg: "2" }}
            w="full"
            position={{ base: "static", lg: "sticky" }}
            top={{ lg: 4 }}
          >
            <Box
              borderWidth="2px"
              borderColor="blue.200"
              borderRadius="lg"
              p={5}
              bg="blue.50"
            >
              <Text fontSize="lg" fontWeight="700" color="gray.800" mb={4}>
                📦 Your Items
              </Text>

              {items.length === 0 ? (
                <Text fontSize="sm" color="gray.500">
                  No items selected yet. Click items on the left to add them.
                </Text>
              ) : (
                <VStack gap={2} align="stretch" mb={4}>
                  {items.map((item) => {
                    const img = getItemImage(item.id);
                    return (
                      <Flex
                        key={item.id}
                        align="center"
                        bg="white"
                        borderRadius="md"
                        px={3}
                        py={2}
                        gap={3}
                      >
                        {/* Thumbnail */}
                        {img && (
                          <Box
                            w="40px"
                            h="40px"
                            borderRadius="md"
                            overflow="hidden"
                            flexShrink={0}
                            position="relative"
                            bg="gray.100"
                          >
                            <Image
                              src={img}
                              alt={item.name}
                              fill
                              sizes="40px"
                              style={{ objectFit: "cover" }}
                            />
                          </Box>
                        )}
                        <Box flex={1} minW="100px">
                          <Text fontSize="sm" fontWeight="600" color="gray.800">
                            {item.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {item.weightKg}kg · {item.volumeM3}m³
                          </Text>
                        </Box>
                        <HStack gap={1} flexShrink={0}>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            −
                          </Button>
                          <Text
                            fontSize="sm"
                            fontWeight="700"
                            minW="24px"
                            textAlign="center"
                          >
                            {item.quantity}
                          </Text>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            +
                          </Button>
                        </HStack>
                      </Flex>
                    );
                  })}
                </VStack>
              )}

              {/* Totals */}
              {items.length > 0 && (
                <Box borderTop="2px solid" borderColor="blue.200" pt={4} mt={2}>
                  <VStack gap={2} align="stretch">
                    <Flex justify="space-between">
                      <Text fontSize="sm" fontWeight="600" color="gray.700">
                        Total Volume:
                      </Text>
                      <Text fontSize="sm" fontWeight="700" color="blue.600">
                        {totalVolume.toFixed(2)} m³
                      </Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontSize="sm" fontWeight="600" color="gray.700">
                        Total Weight:
                      </Text>
                      <Text fontSize="sm" fontWeight="700" color="blue.600">
                        {totalWeight.toFixed(0)} kg
                      </Text>
                    </Flex>
                    <Box
                      mt={2}
                      p={3}
                      bg="green.100"
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="green.300"
                    >
                      <Text fontSize="xs" fontWeight="600" color="green.800" mb={1}>
                        🚐 Recommended Vehicle:
                      </Text>
                      <Text fontSize="sm" fontWeight="700" color="green.900">
                        {vehicleRecommendation}
                      </Text>
                    </Box>
                  </VStack>
                </Box>
              )}
            </Box>
          </Box>
        </Flex>

        {/* ── NAVIGATION ──────────────────────────────────── */}
        <HStack justify="space-between" pt={4} borderTop="1px solid" borderColor="gray.200">
          <Button variant="ghost" onClick={onBack} fontWeight="600">
            ← Back
          </Button>
          <Button
            colorPalette="blue"
            size="lg"
            fontWeight="700"
            onClick={handleNext}
            disabled={items.length === 0 && !notSure && !hasLargeItems}
            opacity={items.length > 0 || notSure || hasLargeItems ? 1 : 0.5}
            cursor={items.length > 0 || notSure || hasLargeItems ? "pointer" : "not-allowed"}
          >
            Next: Schedule →
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
