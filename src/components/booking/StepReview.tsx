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
  estimatedPrice: number;
  priceRange: { min: number; max: number };
  explanation: string;
  distanceKm: number;
  durationMinutes: number;
}

export function StepReview({ form, onNext, onBack }: StepReviewProps) {
  const [loading, setLoading] = useState(false);
  const [pricingEngine, setPricingEngine] = useState<PricingEngineResult | null>(null);
  const [jobResult, setJobResult] = useState<JobCreateResult | null>(null);
  const [error, setError] = useState("");
  const [contactError, setContactError] = useState("");

  const vals = form.getValues();
  const timeLabel =
    TIME_WINDOWS.find((tw) => tw.value === vals.schedule.timeWindow)
      ?.label ?? "";
  const totalItems = vals.items.reduce((s, i) => s + i.quantity, 0);
  const totalWeight = vals.items.reduce(
    (s, i) => s + i.weightKg * i.quantity,
    0
  );

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
      // Determine job type heuristically
      const jobType =
        vals.jobType && vals.jobType !== ""
          ? vals.jobType
          : vals.items.length > 5
            ? "house_move"
            : "single_item";

      // First call the pricing engine for a detailed breakdown
      const pricingRes = await fetch("/api/pricing/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobType,
          distanceKm: vals.distanceKm ?? 15, // fallback; will be overwritten by job create
          items: vals.items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            weightKg: i.weightKg,
            volumeM3: i.volumeM3,
          })),
          pickupFloor: vals.pickup.floor,
          pickupHasElevator: vals.pickup.hasLift,
          deliveryFloor: vals.dropoff.floor,
          deliveryHasElevator: vals.dropoff.hasLift,
          requiresPackaging: vals.needsPacking,
          requiresAssembly: false,
          requiresDisassembly: false,
          requiresCleaning: false,
          insuranceLevel: "basic",
          preferredDate: vals.schedule.preferredDate,
        }),
      });

      if (pricingRes.ok) {
        const engineData: PricingEngineResult = await pricingRes.json();
        setPricingEngine(engineData);
      }

      // Then create the job (which also gets distance via Mapbox)
      const itemsPayload = vals.items.map((i) => ({
        name: i.name,
        category: i.category,
        quantity: i.quantity,
        weightKg: i.weightKg,
        volumeM3: i.volumeM3,
        fragile: i.fragile,
        notes: i.notes,
        specialHandling: i.fragile ? "Handle with care" : undefined,
      }));

      const res = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactEmail: vals.contactEmail,
          contactName: vals.contactName,
          contactPhone: vals.contactPhone,
          jobType,
          pickupAddress: vals.pickup.address,
          deliveryAddress: vals.dropoff.address,
          moveDate: new Date(vals.schedule.preferredDate).toISOString(),
          needsPacking: vals.needsPacking,
          pickupFloor: vals.pickup.floor,
          pickupFlat: vals.pickup.flat,
          pickupHasLift: vals.pickup.hasLift,
          pickupNotes: vals.pickup.notes,
          deliveryFloor: vals.dropoff.floor,
          deliveryFlat: vals.dropoff.flat,
          deliveryHasLift: vals.dropoff.hasLift,
          deliveryNotes: vals.dropoff.notes,
          preferredTimeWindow: vals.schedule.timeWindow,
          flexibleDates: vals.schedule.flexibleDates,
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
      form.setValue("estimatedPrice", data.estimatedPrice);
      form.setValue("priceRange", data.priceRange);
      form.setValue("distanceKm", data.distanceKm);
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
    <Box bg="white" borderRadius="12px" boxShadow="0 1px 3px rgba(0,0,0,0.08)" p={{ base: 5, md: 8 }}>
      <VStack gap={5} align="stretch">
        <Box>
          <Text fontSize="xl" fontWeight="800" color="#111827">
            Review your booking
          </Text>
          <Text fontSize="15px" color="#6B7280">
            Check the details below, then get your instant price.
          </Text>
        </Box>

        {/* Summary sections */}
        <SummarySection title="Pickup">
          <SummaryLine label="Address" value={vals.pickup.address} />
          {vals.pickup.floor > 0 && (
            <SummaryLine
              label="Floor"
              value={`Level ${vals.pickup.floor}${vals.pickup.hasLift ? " (lift available)" : ""}`}
            />
          )}
          {vals.pickup.flat && (
            <SummaryLine label="Flat" value={vals.pickup.flat} />
          )}
          {vals.pickup.notes && (
            <SummaryLine label="Notes" value={vals.pickup.notes} />
          )}
        </SummarySection>

        <SummarySection title="Drop-off">
          <SummaryLine
            label="Address"
            value={vals.dropoff.address}
          />
          {vals.dropoff.floor > 0 && (
            <SummaryLine
              label="Floor"
              value={`Level ${vals.dropoff.floor}${vals.dropoff.hasLift ? " (lift available)" : ""}`}
            />
          )}
          {vals.dropoff.flat && (
            <SummaryLine label="Flat" value={vals.dropoff.flat} />
          )}
          {vals.dropoff.notes && (
            <SummaryLine label="Notes" value={vals.dropoff.notes} />
          )}
        </SummarySection>

        <SummarySection title="Items">
          <Text fontSize="sm" color="gray.600">
            {totalItems} item{totalItems !== 1 ? "s" : ""} ·{" "}
            ~{totalWeight.toFixed(1)} kg total
          </Text>
          <VStack gap={1} mt={2} align="stretch">
            {vals.items.map((item) => (
              <Flex
                key={item.id}
                justify="space-between"
                fontSize="sm"
              >
                <Text color="gray.700">
                  {item.name}
                  {item.fragile && (
                    <Badge
                      ml={1}
                      fontSize="2xs"
                      colorPalette="red"
                    >
                      Fragile
                    </Badge>
                  )}
                </Text>
                <Text color="gray.500">×{item.quantity}</Text>
              </Flex>
            ))}
          </VStack>
          {vals.needsPacking && (
            <Badge mt={2} colorPalette="blue">
              Packing service requested
            </Badge>
          )}
        </SummarySection>

        <SummarySection title="Schedule">
          <SummaryLine
            label="Date"
            value={new Date(
              vals.schedule.preferredDate
            ).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          />
          <SummaryLine label="Time" value={timeLabel} />
          {vals.schedule.flexibleDates && (
            <Badge colorPalette="green">Flexible dates</Badge>
          )}
        </SummarySection>

        {/* Contact info — editable fields */}
        <Box
          borderWidth="1px"
          borderColor="blue.200"
          borderRadius="lg"
          p={4}
          bg="blue.50"
        >
          <Text fontSize="sm" fontWeight="700" color="gray.800" mb={3}>
            Contact Details
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

        {/* Pricing — Detailed Breakdown */}
        {(pricingEngine || jobResult) && (
          <VStack gap={4} align="stretch">
            {/* Price range banner — THE PRICE. FIRST. BIGGEST. */}
            <Box
              bg="#EBF1FF"
              borderRadius="12px"
              p={6}
              borderWidth="1px"
              borderColor="#D4E2FF"
              textAlign="center"
              className="price-reveal"
            >
              <Text fontSize="14px" color="#6B7280" mb={2}>
                Estimated Price (incl. VAT)
              </Text>
              {pricingEngine ? (
                <>
                  <Text fontSize={{ base: "2.5rem", md: "3rem" }} fontWeight="800" color="#1D4ED8" lineHeight="1.1">
                    £{pricingEngine.priceMin} – £{pricingEngine.priceMax}
                  </Text>
                  <Text fontSize="lg" fontWeight="700" color="#374151" mt={2}>
                    Mid-point: £{pricingEngine.totalPrice.toFixed(2)}
                  </Text>
                </>
              ) : jobResult ? (
                <>
                  <Text fontSize={{ base: "2.5rem", md: "3rem" }} fontWeight="800" color="#1D4ED8" lineHeight="1.1">
                    £{jobResult.priceRange.min.toFixed(2)} – £{jobResult.priceRange.max.toFixed(2)}
                  </Text>
                  <Text fontSize="lg" fontWeight="700" color="#374151" mt={2}>
                    £{jobResult.estimatedPrice.toFixed(2)}
                  </Text>
                </>
              ) : null}
            </Box>

            {/* Info cards (from pricing engine) */}
            {pricingEngine && (
              <SimpleGrid columns={{ base: 2, md: 4 }} gap={3}>
                <InfoCard label="Vehicle" value={pricingEngine.recommendedVehicle} />
                <InfoCard
                  label="Volume"
                  value={`${pricingEngine.totalVolumeM3} m³`}
                  sub={`${pricingEngine.totalWeightKg} kg`}
                />
                <InfoCard
                  label="Duration"
                  value={`${pricingEngine.estimatedDurationHours}h`}
                />
                <InfoCard
                  label="Demand"
                  value={`×${pricingEngine.demandMultiplier}`}
                  sub={
                    pricingEngine.demandMultiplier > 1.1
                      ? "Peak period"
                      : pricingEngine.demandMultiplier < 0.95
                        ? "Off-peak"
                        : "Standard"
                  }
                />
              </SimpleGrid>
            )}

            {/* Breakdown list */}
            {pricingEngine && pricingEngine.breakdown.length > 0 && (
              <Box borderWidth="1px" borderColor="gray.100" borderRadius="lg" p={4}>
                <Text fontSize="sm" fontWeight="700" color="gray.800" mb={3}>
                  Price Breakdown
                </Text>
                <VStack gap={1} align="stretch">
                  {pricingEngine.breakdown.map((line, i) => (
                    <Flex key={i} justify="space-between" fontSize="sm">
                      <Text color="gray.600">{line.label}</Text>
                      <Text color="gray.800" fontWeight="500">
                        £{line.amount.toFixed(2)}
                      </Text>
                    </Flex>
                  ))}
                  <Box borderTopWidth="1px" borderColor="gray.200" pt={2} mt={1}>
                    <Flex justify="space-between" fontWeight="700">
                      <Text color="#111827">Total (incl. VAT)</Text>
                      <Text color="#1D4ED8" fontSize="lg">£{pricingEngine.totalPrice.toFixed(2)}</Text>
                    </Flex>
                  </Box>
                </VStack>
              </Box>
            )}

            {/* AI insights */}
            {pricingEngine?.aiConfidence != null && (
              <Box bg="green.50" borderRadius="lg" p={4} borderWidth="1px" borderColor="green.200">
                <HStack gap={2} mb={1}>
                  <Badge colorPalette="green">AI Verified</Badge>
                  <Text fontSize="xs" color="gray.500">
                    Confidence: {pricingEngine.aiConfidence}%
                  </Text>
                </HStack>
                {pricingEngine.aiExplanation && (
                  <Text fontSize="sm" color="gray.700">{pricingEngine.aiExplanation}</Text>
                )}
              </Box>
            )}

            {/* AI Warnings */}
            {pricingEngine?.aiWarnings && pricingEngine.aiWarnings.length > 0 && (
              <Box bg="orange.50" borderRadius="lg" p={4} borderWidth="1px" borderColor="orange.200">
                <Text fontSize="sm" fontWeight="700" color="orange.700" mb={1}>Notes</Text>
                {pricingEngine.aiWarnings.map((w, i) => (
                  <Text key={i} fontSize="sm" color="orange.800">• {w}</Text>
                ))}
              </Box>
            )}

            {/* Distance & drive time from job creation */}
            {jobResult && (
              <HStack gap={4}>
                <Text fontSize="xs" color="gray.400">
                  {jobResult.distanceKm.toFixed(1)} km
                </Text>
                <Text fontSize="xs" color="gray.400">
                  ~{jobResult.durationMinutes} min drive
                </Text>
              </HStack>
            )}
          </VStack>
        )}

        {error && (
          <Text fontSize="sm" color="red.500" fontWeight="600">
            {error}
          </Text>
        )}

        <HStack justify="space-between" pt={4}>
          <Button variant="ghost" onClick={onBack} fontWeight="600">
            Back
          </Button>
          {jobResult ? (
            <Button
              bg="#F59E0B"
              color="#111827"
              size="lg"
              fontWeight="700"
              borderRadius="8px"
              h="48px"
              _hover={{ bg: "#D97706" }}
              _active={{ bg: "#B45309" }}
              onClick={onNext}
            >
              Proceed to Payment →
            </Button>
          ) : (
            <Button
              bg="#1D4ED8"
              color="white"
              size="lg"
              fontWeight="700"
              borderRadius="8px"
              h="48px"
              _hover={{ bg: "#1840B8" }}
              _active={{ bg: "#133498" }}
              onClick={fetchPricing}
              disabled={loading}
            >
              {loading ? "Calculating..." : "Get Instant Price"}
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}

function SummarySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      borderWidth="1px"
      borderColor="gray.100"
      borderRadius="lg"
      p={4}
    >
      <Text fontSize="sm" fontWeight="700" color="gray.800" mb={2}>
        {title}
      </Text>
      {children}
    </Box>
  );
}

function SummaryLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Flex justify="space-between" fontSize="sm" py={0.5}>
      <Text color="gray.500">{label}</Text>
      <Text
        color="gray.700"
        fontWeight="500"
        textAlign="right"
        maxW="60%"
      >
        {value}
      </Text>
    </Flex>
  );
}

function InfoCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Box
      borderWidth="1px"
      borderColor="gray.100"
      borderRadius="lg"
      p={3}
      textAlign="center"
    >
      <Text fontSize="2xs" color="gray.400" textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="700" color="gray.800">
        {value}
      </Text>
      {sub && (
        <Text fontSize="2xs" color="gray.500">
          {sub}
        </Text>
      )}
    </Box>
  );
}
