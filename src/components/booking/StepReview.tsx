"use client";

import { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Flex,
  Badge,
  SimpleGrid,
} from "@chakra-ui/react";
import { TIME_WINDOWS } from "./types";
import type { BookingForm } from "./types";
import { formatGBP } from "@/lib/money/format";
import { ConfirmAddressModal } from "./ConfirmAddressModal";

interface StepReviewProps {
  form: BookingForm;
  onNext: () => void;
  onBack: () => void;
}

interface BreakdownLine {
  label: string;
  amount: number;
}

interface PricingEngineResult {
  totalPrice: number;
  priceMin: number;
  priceMax: number;
  subtotal: number;
  vatAmount: number;
  recommendedVehicle: string;
  totalVolumeM3: number;
  totalWeightKg: number;
  numberOfVehicles: number;
  estimatedDurationHours: number;
  demandMultiplier: number;
  breakdown: BreakdownLine[];
  aiConfidence: number | null;
  aiWarnings: string[];
  aiExplanation: string | null;
}

interface JobCreateResult {
  jobId: string;
  referenceNumber: string;
  estimatedPrice: number;
  priceRange: { min: number; max: number };
  explanation: string;
  distanceMiles: number;
  durationMinutes: number;
}

export function StepReview({ form, onNext, onBack }: StepReviewProps) {
  const [loading, setLoading] = useState(false);
  const [pricingEngine, setPricingEngine] = useState<PricingEngineResult | null>(null);
  const [jobResult, setJobResult] = useState<JobCreateResult | null>(null);
  const [error, setError] = useState("");
  const [contactError, setContactError] = useState("");
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Add-ons state
  const [packingAddon, setPackingAddon] = useState(false);
  const [insuranceAddon, setInsuranceAddon] = useState(false);
  const [assemblyAddon, setAssemblyAddon] = useState(false);

  const vals = form.getValues();
  const timeLabel =
    TIME_WINDOWS.find((tw) => tw.value === vals.schedule.timeWindow)
      ?.label ?? "";
  const totalItems = vals.items.reduce((s, i) => s + i.quantity, 0);
  const totalWeight = vals.items.reduce(
    (s, i) => s + i.weightKg * i.quantity,
    0
  );
  const totalVolume = vals.items.reduce(
    (s, i) => s + i.volumeM3 * i.quantity,
    0
  );

  // Calculate add-ons cost
  const addOnsCost = 
    (packingAddon ? (totalItems > 20 ? 150 : 50) : 0) +
    (insuranceAddon ? 25 : 0) +
    (assemblyAddon ? 60 : 0);

  // Final price with add-ons
  const finalMinPrice = (pricingEngine?.priceMin || jobResult?.priceRange.min || 0) + addOnsCost;
  const finalMaxPrice = (pricingEngine?.priceMax || jobResult?.priceRange.max || 0) + addOnsCost;
  const finalMidPrice = (pricingEngine?.totalPrice || jobResult?.estimatedPrice || 0) + addOnsCost;

  // UK average comparison (mock calculation)
  const ukAverageSaving = pricingEngine ? Math.round(((pricingEngine.demandMultiplier < 1 ? 15 : 8))) : null;

  /** Check if addresses need confirmation before proceeding */
  const handleContinue = () => {
    const currentVals = form.getValues();
    
    // Check pickup
    const pickupNeedsConfirm = 
      currentVals.pickup.precision === "postcode" &&
      !currentVals.pickup.confirmed;
    
    // Check dropoff
    const dropoffNeedsConfirm =
      currentVals.dropoff.precision === "postcode" &&
      !currentVals.dropoff.confirmed;
    
    // If either needs confirmation, show modal
    if (pickupNeedsConfirm || dropoffNeedsConfirm) {
      setShowConfirmModal(true);
      return;
    }
    
    // Otherwise proceed normally
    onNext();
  };

  /** Handle address confirmation from modal */
  const handleConfirmPickup = (data: {
    address: string;
    lat: number;
    lng: number;
  }) => {
    form.setValue("pickup.address", data.address);
    form.setValue("pickup.lat", data.lat);
    form.setValue("pickup.lng", data.lng);
    form.setValue("pickup.confirmed", true);
    form.setValue("pickup.precision", "full");
  };

  const handleConfirmDropoff = (data: {
    address: string;
    lat: number;
    lng: number;
  }) => {
    form.setValue("dropoff.address", data.address);
    form.setValue("dropoff.lat", data.lat);
    form.setValue("dropoff.lng", data.lng);
    form.setValue("dropoff.confirmed", true);
    form.setValue("dropoff.precision", "full");
  };

  const handleCloseModal = () => {
    const currentVals = form.getValues();
    const allConfirmed =
      (!currentVals.pickup.precision || currentVals.pickup.precision !== "postcode" || currentVals.pickup.confirmed) &&
      (!currentVals.dropoff.precision || currentVals.dropoff.precision !== "postcode" || currentVals.dropoff.confirmed);
    
    if (allConfirmed) {
      setShowConfirmModal(false);
      onNext(); // Proceed to payment
    } else {
      setShowConfirmModal(false);
    }
  };

  /** Step 1: Get detailed pricing breakdown from the pricing engine. */
  const fetchPricing = async () => {
    // Validate contact fields before proceeding
    const currentVals = form.getValues();
    const name = (currentVals.contactName ?? "").trim();
    const email = (currentVals.contactEmail ?? "").trim();
    const phone = (currentVals.contactPhone ?? "").trim();

    if (!name || !email || !phone) {
      setContactError("Please fill in all contact fields before getting a price.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setContactError("Please enter a valid email address.");
      return;
    }
    setContactError("");

    setLoading(true);
    setError("");

    try {
      // Use fresh values (currentVals) for all API calls
      // Determine job type heuristically
      const jobType =
        currentVals.jobType && currentVals.jobType !== ""
          ? currentVals.jobType
          : currentVals.items.length > 5
            ? "house_move"
            : "single_item";

      // First call the pricing engine for a detailed breakdown
      const pricingRes = await fetch("/api/pricing/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobType,
          distanceMiles: currentVals.distanceMiles ?? 10,
          items: currentVals.items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            weightKg: i.weightKg,
            volumeM3: i.volumeM3,
          })),
          pickupFloor: currentVals.pickup.floor,
          pickupHasElevator: currentVals.pickup.hasLift,
          deliveryFloor: currentVals.dropoff.floor,
          deliveryHasElevator: currentVals.dropoff.hasLift,
          requiresPackaging: currentVals.needsPacking,
          requiresAssembly: false,
          requiresDisassembly: false,
          requiresCleaning: false,
          insuranceLevel: "basic",
          preferredDate: currentVals.schedule.preferredDate,
        }),
      });

      if (pricingRes.ok) {
        const engineData: PricingEngineResult = await pricingRes.json();
        setPricingEngine(engineData);
      }

      // Update existing draft job or create new one
      const itemsPayload = currentVals.items.map((i) => ({
        name: i.name,
        category: i.category,
        quantity: i.quantity,
        weightKg: i.weightKg,
        volumeM3: i.volumeM3,
        fragile: i.fragile,
        notes: i.notes,
        specialHandling: i.fragile ? "Handle with care" : undefined,
      }));

      const existingJobId = currentVals.jobId;
      const res = existingJobId
        ? // Update existing draft job created at Step 1
          await fetch(`/api/jobs/${existingJobId}/update`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contactEmail: email,
              contactName: name,
              contactPhone: phone,
              description: "",
              needsPacking: currentVals.needsPacking,
              pickupFloor: currentVals.pickup.floor,
              pickupFlat: currentVals.pickup.flat,
              pickupHasLift: currentVals.pickup.hasLift,
              pickupNotes: currentVals.pickup.notes,
              deliveryFloor: currentVals.dropoff.floor,
              deliveryFlat: currentVals.dropoff.flat,
              deliveryHasLift: currentVals.dropoff.hasLift,
              deliveryNotes: currentVals.dropoff.notes,
              preferredTimeWindow: currentVals.schedule.timeWindow,
              flexibleDates: currentVals.schedule.flexibleDates,
              items: itemsPayload,
            }),
          })
        : // Fallback: create new job if draft creation failed
          await fetch("/api/jobs/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contactEmail: email,
              contactName: name,
              contactPhone: phone,
              jobType,
              pickupAddress: currentVals.pickup.address,
              deliveryAddress: currentVals.dropoff.address,
              moveDate: new Date(currentVals.schedule.preferredDate).toISOString(),
              needsPacking: currentVals.needsPacking,
              pickupFloor: currentVals.pickup.floor,
              pickupFlat: currentVals.pickup.flat,
              pickupHasLift: currentVals.pickup.hasLift,
              pickupNotes: currentVals.pickup.notes,
              deliveryFloor: currentVals.dropoff.floor,
              deliveryFlat: currentVals.dropoff.flat,
              deliveryHasLift: currentVals.dropoff.hasLift,
              deliveryNotes: currentVals.dropoff.notes,
              preferredTimeWindow: currentVals.schedule.timeWindow,
              flexibleDates: currentVals.schedule.flexibleDates,
              items: itemsPayload,
            }),
          });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create job.");
      }

      const data: JobCreateResult = await res.json();
      setJobResult(data);
      form.setValue("jobId", data.jobId);
      form.setValue("referenceNumber", data.referenceNumber);
      form.setValue("estimatedPrice", data.estimatedPrice);
      form.setValue("priceRange", data.priceRange);
      form.setValue("distanceMiles", data.distanceMiles);
      form.setValue("durationMinutes", data.durationMinutes);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="white" borderRadius="xl" shadow="sm" p={{ base: 5, md: 8 }}>
      <VStack gap={6} align="stretch">
        <Box>
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
            <Box>
              <Text fontSize="xl" fontWeight="800" color="gray.800">
                Review & Get Quote
              </Text>
              <Text fontSize="sm" color="gray.500">
                Check the details below, then get your instant price.
              </Text>
            </Box>
            {jobResult?.referenceNumber && (
              <Badge
                colorPalette="blue"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="sm"
                fontWeight="700"
              >
                Ref: {jobResult.referenceNumber}
              </Badge>
            )}
          </Flex>
        </Box>

        {/* ── 2-COLUMN LAYOUT ───────────────────────────────────── */}
        <Flex gap={6} direction={{ base: "column", lg: "row" }} align="start">
          {/* ── LEFT PANEL: Summary ─────────────────────  */}
          <Box flex={{ base: "1", lg: "1" }} w="full">
            <VStack gap={4} align="stretch">
              {/* 📍 Your Move */}
              <Box
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="lg"
                p={4}
                bg="gray.50"
              >
                <Text fontSize="md" fontWeight="700" color="gray.800" mb={3}>
                  📍 Your Move
                </Text>
                <VStack gap={2} align="stretch" fontSize="sm">
                  <Flex justify="space-between">
                    <Text color="gray.600">Pickup:</Text>
                    <Text color="gray.800" fontWeight="600" textAlign="right">
                      {vals.pickup.address}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.600">Delivery:</Text>
                    <Text color="gray.800" fontWeight="600" textAlign="right">
                      {vals.dropoff.address}
                    </Text>
                  </Flex>
                  {jobResult && (
                    <Flex justify="space-between">
                      <Text color="gray.600">Distance:</Text>
                      <Text color="gray.800" fontWeight="600">
                        {jobResult.distanceMiles.toFixed(1)} miles (~
                        {jobResult.durationMinutes} min)
                      </Text>
                    </Flex>
                  )}
                  <Flex justify="space-between">
                    <Text color="gray.600">Date:</Text>
                    <Text color="gray.800" fontWeight="600">
                      {new Date(vals.schedule.preferredDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}{" "}
                      ({timeLabel})
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.600">Pickup Floor:</Text>
                    <Text color="gray.800" fontWeight="600">
                      {vals.pickup.floor === 0
                        ? "Ground"
                        : `${vals.pickup.floor}${vals.pickup.floor === 1 ? "st" : vals.pickup.floor === 2 ? "nd" : vals.pickup.floor === 3 ? "rd" : "th"}`}
                      {vals.pickup.hasLift ? " (Lift ✓)" : ""}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.600">Delivery Floor:</Text>
                    <Text color="gray.800" fontWeight="600">
                      {vals.dropoff.floor === 0
                        ? "Ground"
                        : `${vals.dropoff.floor}${vals.dropoff.floor === 1 ? "st" : vals.dropoff.floor === 2 ? "nd" : vals.dropoff.floor === 3 ? "rd" : "th"}`}
                      {vals.dropoff.hasLift ? " (Lift ✓)" : ""}
                    </Text>
                  </Flex>
                </VStack>
              </Box>

              {/* 📦 Your Items */}
              <Box
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="lg"
                p={4}
                bg="gray.50"
              >
                <Text fontSize="md" fontWeight="700" color="gray.800" mb={3}>
                  📦 Your Items
                </Text>
                <VStack gap={1} align="stretch" fontSize="sm" mb={3}>
                  {vals.items.map((item) => (
                    <Flex key={item.id} justify="space-between">
                      <Text color="gray.700">
                        {item.name}
                        {item.fragile && (
                          <Badge ml={1} fontSize="2xs" colorPalette="red">
                            Fragile
                          </Badge>
                        )}
                      </Text>
                      <Text color="gray.500">×{item.quantity}</Text>
                    </Flex>
                  ))}
                </VStack>
                <HStack gap={4} pt={2} borderTop="1px solid" borderColor="gray.200">
                  <Box>
                    <Text fontSize="xs" color="gray.500">Total Items</Text>
                    <Text fontSize="sm" fontWeight="700" color="gray.800">
                      {totalItems}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Total Weight</Text>
                    <Text fontSize="sm" fontWeight="700" color="gray.800">
                      {totalWeight.toFixed(1)} kg
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Total Volume</Text>
                    <Text fontSize="sm" fontWeight="700" color="gray.800">
                      {totalVolume.toFixed(2)} m³
                    </Text>
                  </Box>
                </HStack>
              </Box>

              {/* Contact info */}
              <Box
                borderWidth="1px"
                borderColor="blue.200"
                borderRadius="lg"
                p={4}
                bg="blue.50"
              >
                <Text fontSize="sm" fontWeight="700" color="gray.800" mb={3}>
                  📞 Contact Details
                </Text>
                <VStack gap={3} align="stretch">
                  <Box>
                    <Text fontSize="xs" fontWeight="600" color="gray.600" mb={1}>
                      Full Name *
                    </Text>
                    <input
                      type="text"
                      placeholder="e.g. John Smith"
                      {...form.register("contactName")}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        fontSize: "14px",
                        background: "white",
                        outline: "none",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                      onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                    />
                  </Box>
                  <Box>
                    <Text fontSize="xs" fontWeight="600" color="gray.600" mb={1}>
                      Email Address *
                    </Text>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      {...form.register("contactEmail")}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        fontSize: "14px",
                        background: "white",
                        outline: "none",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                      onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                    />
                  </Box>
                  <Box>
                    <Text fontSize="xs" fontWeight="600" color="gray.600" mb={1}>
                      Phone Number *
                    </Text>
                    <input
                      type="tel"
                      placeholder="07XXX XXXXXX"
                      {...form.register("contactPhone")}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        fontSize: "14px",
                        background: "white",
                        outline: "none",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                      onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                    />
                  </Box>
                  {contactError && (
                    <Text fontSize="xs" color="red.500" fontWeight="600">
                      {contactError}
                    </Text>
                  )}
                </VStack>
              </Box>
            </VStack>
          </Box>

          {/* ── RIGHT PANEL: Price Card ─────────────────  */}
          <Box
            flex={{ base: "1", lg: "1" }}
            w="full"
            position={{ base: "static", lg: "sticky" }}
            top={{ lg: 4 }}
          >
            {(pricingEngine || jobResult) ? (
              <VStack gap={4} align="stretch">
                {/* Price Card with Gradient */}
                <Box
                  background="linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)"
                  borderRadius="lg"
                  p={6}
                  color="white"
                  textAlign="center"
                >
                  <Text fontSize="sm" opacity={0.9} mb={2}>
                    Estimated Price
                  </Text>
                  <Text fontSize="3xl" fontWeight="900" lineHeight="1.1" mb={1}>
                    {formatGBP(finalMinPrice)} – {formatGBP(finalMaxPrice)}
                  </Text>
                  <Text fontSize="xs" opacity={0.8}>
                    Including VAT
                  </Text>

                  {/* Collapsible breakdown */}
                  <Box mt={4}>
                    <Button
                      size="sm"
                      variant="ghost"
                      color="white"
                      _hover={{ bg: "rgba(255,255,255,0.1)" }}
                      onClick={() => setShowBreakdown(!showBreakdown)}
                      w="full"
                    >
                      {showBreakdown ? "Hide" : "Show"} Breakdown
                    </Button>
                    {showBreakdown && pricingEngine && (
                      <VStack gap={1} align="stretch" mt={3} fontSize="sm">
                        {pricingEngine.breakdown.map((line, i) => (
                          <Flex key={i} justify="space-between">
                            <Text opacity={0.9}>{line.label}</Text>
                            <Text fontWeight="600">{formatGBP(line.amount)}</Text>
                          </Flex>
                        ))}
                        {addOnsCost > 0 && (
                          <Flex justify="space-between">
                            <Text opacity={0.9}>Add-ons</Text>
                            <Text fontWeight="600">{formatGBP(addOnsCost)}</Text>
                          </Flex>
                        )}
                        <Box borderTop="1px solid rgba(255,255,255,0.3)" pt={2} mt={1}>
                          <Flex justify="space-between" fontWeight="700">
                            <Text>Total</Text>
                            <Text>{formatGBP(finalMidPrice)}</Text>
                          </Flex>
                        </Box>
                      </VStack>
                    )}
                  </Box>
                </Box>

                {/* UK Average Comparison */}
                {ukAverageSaving && (
                  <Text fontSize="sm" color="green.600" fontWeight="600" textAlign="center">
                    💡 This is {ukAverageSaving}% cheaper than UK average
                  </Text>
                )}

                {/* Add-ons Section */}
                <Box>
                  <Text fontSize="md" fontWeight="700" color="gray.800" mb={3}>
                    Optional Add-ons
                  </Text>
                  <VStack gap={2} align="stretch">
                    {/* Packing Service */}
                    <Flex
                      as="label"
                      align="center"
                      justify="space-between"
                      p={3}
                      borderWidth="2px"
                      borderColor={packingAddon ? "blue.400" : "gray.200"}
                      borderRadius="lg"
                      cursor="pointer"
                      bg={packingAddon ? "blue.50" : "white"}
                      _hover={{ borderColor: "blue.300" }}
                    >
                      <HStack gap={2}>
                        <input
                          type="checkbox"
                          checked={packingAddon}
                          onChange={(e) => setPackingAddon(e.target.checked)}
                          style={{ width: 18, height: 18, accentColor: "#1D4ED8" }}
                        />
                        <Box>
                          <Text fontSize="sm" fontWeight="600" color="gray.800">
                            📦 Packing Service
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Professional packing materials & service
                          </Text>
                        </Box>
                      </HStack>
                      <Text fontSize="sm" fontWeight="700" color="blue.600">
                        +{formatGBP(totalItems > 20 ? 150 : 50)}
                      </Text>
                    </Flex>

                    {/* Insurance Upgrade */}
                    <Flex
                      as="label"
                      align="center"
                      justify="space-between"
                      p={3}
                      borderWidth="2px"
                      borderColor={insuranceAddon ? "blue.400" : "gray.200"}
                      borderRadius="lg"
                      cursor="pointer"
                      bg={insuranceAddon ? "blue.50" : "white"}
                      _hover={{ borderColor: "blue.300" }}
                    >
                      <HStack gap={2}>
                        <input
                          type="checkbox"
                          checked={insuranceAddon}
                          onChange={(e) => setInsuranceAddon(e.target.checked)}
                          style={{ width: 18, height: 18, accentColor: "#1D4ED8" }}
                        />
                        <Box>
                          <Text fontSize="sm" fontWeight="600" color="gray.800">
                            🔒 Insurance Upgrade
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            £50,000 goods in transit cover
                          </Text>
                        </Box>
                      </HStack>
                      <Text fontSize="sm" fontWeight="700" color="blue.600">
                        +{formatGBP(25)}
                      </Text>
                    </Flex>

                    {/* Furniture Assembly */}
                    <Flex
                      as="label"
                      align="center"
                      justify="space-between"
                      p={3}
                      borderWidth="2px"
                      borderColor={assemblyAddon ? "blue.400" : "gray.200"}
                      borderRadius="lg"
                      cursor="pointer"
                      bg={assemblyAddon ? "blue.50" : "white"}
                      _hover={{ borderColor: "blue.300" }}
                    >
                      <HStack gap={2}>
                        <input
                          type="checkbox"
                          checked={assemblyAddon}
                          onChange={(e) => setAssemblyAddon(e.target.checked)}
                          style={{ width: 18, height: 18, accentColor: "#1D4ED8" }}
                        />
                        <Box>
                          <Text fontSize="sm" fontWeight="600" color="gray.800">
                            🔧 Furniture Assembly
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Disassembly & reassembly service
                          </Text>
                        </Box>
                      </HStack>
                      <Text fontSize="sm" fontWeight="700" color="blue.600">
                        +{formatGBP(60)}
                      </Text>
                    </Flex>
                  </VStack>
                </Box>

                {/* CTA Button */}
                <Button
                  bg="#F59E0B"
                  color="#111827"
                  size="lg"
                  fontWeight="800"
                  w="full"
                  h="52px"
                  borderRadius="lg"
                  _hover={{ bg: "#D97706" }}
                  _active={{ bg: "#B45309" }}
                  onClick={handleContinue}
                >
                  Confirm & Find Drivers →
                </Button>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  No payment taken yet. Review driver profiles before committing.
                </Text>
              </VStack>
            ) : (
              <Box textAlign="center" p={6}>
                <Text fontSize="md" fontWeight="600" color="gray.600" mb={4}>
                  Complete the contact details to get your instant quote
                </Text>
                <Button
                  bg="#1D4ED8"
                  color="white"
                  size="lg"
                  fontWeight="700"
                  w="full"
                  h="52px"
                  borderRadius="lg"
                  _hover={{ bg: "#1840B8" }}
                  _active={{ bg: "#133498" }}
                  onClick={fetchPricing}
                  disabled={loading}
                >
                  {loading ? "Calculating..." : "Get Instant Price"}
                </Button>
              </Box>
            )}
          </Box>
        </Flex>

        {error && (
          <Text fontSize="sm" color="red.500" fontWeight="600">
            {error}
          </Text>
        )}

        {/* ── NAVIGATION ──────────────────────────────────── */}
        <HStack justify="space-between" pt={4} borderTop="1px solid" borderColor="gray.200">
          <Button variant="ghost" onClick={onBack} fontWeight="600">
            ← Back
          </Button>
        </HStack>
      </VStack>

      {/* ── ADDRESS CONFIRMATION MODAL ───────────────────── */}
      {showConfirmModal && (
        <ConfirmAddressModal
          pickupAddress={vals.pickup.address}
          pickupNeedsConfirm={
            vals.pickup.precision === "postcode" && !vals.pickup.confirmed
          }
          dropoffAddress={vals.dropoff.address}
          dropoffNeedsConfirm={
            vals.dropoff.precision === "postcode" && !vals.dropoff.confirmed
          }
          onConfirmPickup={handleConfirmPickup}
          onConfirmDropoff={handleConfirmDropoff}
          onClose={handleCloseModal}
        />
      )}
    </Box>
  );
}
