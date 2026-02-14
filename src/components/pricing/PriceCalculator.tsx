"use client";

// ─── VanJet · Price Calculator Component ──────────────────────
// Mobile-first, English only, LTR, no car transport options.

import { useState } from "react";
import { formatGBP } from "@/lib/money/format";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Flex,
  Badge,
  SimpleGrid,
  Input,
} from "@chakra-ui/react";

// ── Types ──────────────────────────────────────────────────────

interface ItemRow {
  name: string;
  quantity: number;
  weightKg: number;
  volumeM3: number;
}

interface BreakdownLine {
  label: string;
  amount: number;
}

interface PricingResponse {
  basePrice: number;
  distanceCost: number;
  floorCost: number;
  extraServices: number;
  demandMultiplier: number;
  vehicleMultiplier: number;
  subtotal: number;
  vatAmount: number;
  totalPrice: number;
  recommendedVehicle: string;
  totalVolumeM3: number;
  totalWeightKg: number;
  numberOfVehicles: number;
  estimatedDurationHours: number;
  priceMin: number;
  priceMax: number;
  breakdown: BreakdownLine[];
  aiConfidence: number | null;
  aiWarnings: string[];
  aiExplanation: string | null;
}

const JOB_OPTIONS = [
  { value: "man_and_van", label: "Man & Van" },
  { value: "furniture", label: "Furniture Delivery" },
  { value: "single_item", label: "Single Item Delivery" },
  { value: "house_move", label: "House Move" },
  { value: "home_removal_studio", label: "Studio Flat Removal" },
  { value: "home_removal_1bed", label: "1-Bed Removal" },
  { value: "home_removal_2bed", label: "2-Bed Removal" },
  { value: "home_removal_3bed", label: "3-Bed Removal" },
  { value: "home_removal_4bed", label: "4-Bed Removal" },
  { value: "home_removal_5bed", label: "5-Bed Removal" },
  { value: "student_move", label: "Student Move" },
  { value: "office_small", label: "Small Office Move" },
  { value: "office_medium", label: "Medium Office Move" },
  { value: "office_large", label: "Large Office Move" },
  { value: "office_move", label: "Office Move" },
  { value: "piano_upright", label: "Upright Piano Move" },
  { value: "piano_grand", label: "Grand Piano Move" },
  { value: "piano_specialist", label: "Specialist Item Move" },
  { value: "packing", label: "Packing Service" },
  { value: "storage", label: "Storage & Collection" },
  { value: "storage_monthly", label: "Monthly Storage" },
  { value: "international_europe", label: "International (Europe)" },
];

const INSURANCE_OPTIONS = [
  { value: "basic", label: "Basic (included)" },
  { value: "standard", label: "Standard (£10k cover)" },
  { value: "premium", label: "Premium (£25k cover)" },
];

const EMPTY_ITEM: ItemRow = { name: "", quantity: 1, weightKg: 10, volumeM3: 0.1 };

export function PriceCalculator() {
  // Form state
  const [jobType, setJobType] = useState("house_move");
  const [distanceMiles, setDistanceMiles] = useState(10);
  const [pickupFloor, setPickupFloor] = useState(0);
  const [pickupHasElevator, setPickupHasElevator] = useState(false);
  const [deliveryFloor, setDeliveryFloor] = useState(0);
  const [deliveryHasElevator, setDeliveryHasElevator] = useState(false);
  const [requiresPackaging, setRequiresPackaging] = useState(false);
  const [requiresAssembly, setRequiresAssembly] = useState(false);
  const [requiresDisassembly, setRequiresDisassembly] = useState(false);
  const [requiresCleaning, setRequiresCleaning] = useState(false);
  const [insuranceLevel, setInsuranceLevel] = useState("basic");
  const [preferredDate, setPreferredDate] = useState("");
  const [items, setItems] = useState<ItemRow[]>([{ ...EMPTY_ITEM }]);

  // Result state
  const [result, setResult] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addItem = () => setItems([...items, { ...EMPTY_ITEM }]);
  const removeItem = (idx: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== idx));
  };
  const updateItem = (idx: number, field: keyof ItemRow, val: string | number) => {
    setItems(
      items.map((it, i) => (i === idx ? { ...it, [field]: val } : it))
    );
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/pricing/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobType,
          distanceMiles,
          items: items.filter((i) => i.name.trim()),
          pickupFloor,
          pickupHasElevator,
          deliveryFloor,
          deliveryHasElevator,
          requiresPackaging,
          requiresAssembly,
          requiresDisassembly,
          requiresCleaning,
          insuranceLevel,
          preferredDate: preferredDate || new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Calculation failed.");
      }

      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      maxW="800px"
      mx="auto"
      bg="white"
      borderRadius="xl"
      shadow="sm"
      p={{ base: 4, md: 8 }}
    >
      <VStack gap={5} align="stretch">
        <Box>
          <Text fontSize="xl" fontWeight="800" color="gray.800">
            Price Calculator
          </Text>
          <Text fontSize="sm" color="gray.500">
            Get an instant estimate for your removal or delivery.
          </Text>
        </Box>

        {/* Job type */}
        <FormField label="Job Type">
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
              fontSize: "14px",
              backgroundColor: "white",
            }}
          >
            {JOB_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormField>

        {/* Distance */}
        <FormField label="Distance (miles)">
          <Input
            type="number"
            min={1}
            value={distanceMiles}
            onChange={(e) => setDistanceMiles(Number(e.target.value))}
            size="sm"
          />
        </FormField>

        {/* Preferred date */}
        <FormField label="Preferred Date">
          <Input
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            size="sm"
          />
        </FormField>

        {/* Floors */}
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <Box>
            <FormField label="Pickup Floor">
              <HStack gap={2}>
                <Input
                  type="number"
                  min={0}
                  max={20}
                  value={pickupFloor}
                  onChange={(e) => setPickupFloor(Number(e.target.value))}
                  size="sm"
                  maxW="80px"
                />
                <ToggleButton
                  active={pickupHasElevator}
                  onClick={() => setPickupHasElevator(!pickupHasElevator)}
                  label="Lift"
                />
              </HStack>
            </FormField>
          </Box>
          <Box>
            <FormField label="Delivery Floor">
              <HStack gap={2}>
                <Input
                  type="number"
                  min={0}
                  max={20}
                  value={deliveryFloor}
                  onChange={(e) => setDeliveryFloor(Number(e.target.value))}
                  size="sm"
                  maxW="80px"
                />
                <ToggleButton
                  active={deliveryHasElevator}
                  onClick={() => setDeliveryHasElevator(!deliveryHasElevator)}
                  label="Lift"
                />
              </HStack>
            </FormField>
          </Box>
        </SimpleGrid>

        {/* Extras */}
        <FormField label="Extra Services">
          <Flex wrap="wrap" gap={2}>
            <ToggleButton
              active={requiresPackaging}
              onClick={() => setRequiresPackaging(!requiresPackaging)}
              label="Packing"
            />
            <ToggleButton
              active={requiresAssembly}
              onClick={() => setRequiresAssembly(!requiresAssembly)}
              label="Assembly"
            />
            <ToggleButton
              active={requiresDisassembly}
              onClick={() => setRequiresDisassembly(!requiresDisassembly)}
              label="Disassembly"
            />
            <ToggleButton
              active={requiresCleaning}
              onClick={() => setRequiresCleaning(!requiresCleaning)}
              label="Cleaning"
            />
          </Flex>
        </FormField>

        {/* Insurance */}
        <FormField label="Insurance">
          <select
            value={insuranceLevel}
            onChange={(e) => setInsuranceLevel(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
              fontSize: "14px",
              backgroundColor: "white",
            }}
          >
            {INSURANCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormField>

        {/* Items */}
        <Box>
          <Text fontSize="sm" fontWeight="700" color="gray.700" mb={2}>
            Items
          </Text>
          <VStack gap={2} align="stretch">
            {items.map((item, idx) => (
              <Flex
                key={idx}
                gap={2}
                align="end"
                direction={{ base: "column", md: "row" }}
              >
                <Box flex={1} width={{ base: "100%", md: "auto" }}>
                  <Input
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) =>
                      updateItem(idx, "name", e.target.value)
                    }
                    size="sm"
                  />
                </Box>
                <HStack gap={1}>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(idx, "quantity", Number(e.target.value))
                    }
                    size="sm"
                    maxW="60px"
                    placeholder="Qty"
                  />
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    value={item.weightKg}
                    onChange={(e) =>
                      updateItem(idx, "weightKg", Number(e.target.value))
                    }
                    size="sm"
                    maxW="70px"
                    placeholder="kg"
                  />
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.volumeM3}
                    onChange={(e) =>
                      updateItem(idx, "volumeM3", Number(e.target.value))
                    }
                    size="sm"
                    maxW="70px"
                    placeholder="m³"
                  />
                  {items.length > 1 && (
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="red"
                      onClick={() => removeItem(idx)}
                    >
                      ✕
                    </Button>
                  )}
                </HStack>
              </Flex>
            ))}
            <Button size="xs" variant="outline" onClick={addItem} alignSelf="start">
              + Add item
            </Button>
          </VStack>
        </Box>

        {/* Calculate button */}
        <Button
          colorPalette="blue"
          size="lg"
          fontWeight="700"
          onClick={handleCalculate}
          disabled={loading}
          width="100%"
        >
          {loading ? "Calculating..." : "Get Price Estimate"}
        </Button>

        {error && (
          <Text fontSize="sm" color="red.500" fontWeight="600">
            {error}
          </Text>
        )}

        {/* Results */}
        {result && (
          <VStack gap={4} align="stretch">
            {/* Price range banner */}
            <Box
              bg="blue.50"
              borderRadius="lg"
              p={5}
              borderWidth="1px"
              borderColor="blue.200"
              textAlign="center"
            >
              <Text fontSize="sm" color="gray.500" mb={1}>
                Estimated Price (incl. VAT)
              </Text>
              <Text fontSize="3xl" fontWeight="900" color="blue.600">
                {formatGBP(result.priceMin)} – {formatGBP(result.priceMax)}
              </Text>
              <Text fontSize="lg" fontWeight="700" color="gray.700" mt={1}>
                Mid-point: {formatGBP(result.totalPrice)}
              </Text>
            </Box>

            {/* Info cards */}
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={3}>
              <InfoCard
                label="Vehicle"
                value={result.recommendedVehicle}
                sub={
                  result.numberOfVehicles > 1
                    ? `×${result.numberOfVehicles} trips`
                    : undefined
                }
              />
              <InfoCard
                label="Volume"
                value={`${result.totalVolumeM3} m³`}
                sub={`${result.totalWeightKg} kg`}
              />
              <InfoCard
                label="Duration"
                value={`${result.estimatedDurationHours}h`}
              />
              <InfoCard
                label="Demand"
                value={`×${result.demandMultiplier}`}
                sub={
                  result.demandMultiplier > 1.1
                    ? "Peak period"
                    : result.demandMultiplier < 0.95
                      ? "Off-peak"
                      : "Standard"
                }
              />
            </SimpleGrid>

            {/* Breakdown */}
            <Box
              borderWidth="1px"
              borderColor="gray.100"
              borderRadius="lg"
              p={4}
            >
              <Text fontSize="sm" fontWeight="700" color="gray.800" mb={3}>
                Price Breakdown
              </Text>
              <VStack gap={1} align="stretch">
                {result.breakdown.map((line, i) => (
                  <Flex key={i} justify="space-between" fontSize="sm">
                    <Text color="gray.600">{line.label}</Text>
                    <Text color="gray.800" fontWeight="500">
                      {formatGBP(line.amount)}
                    </Text>
                  </Flex>
                ))}
                <Box
                  borderTopWidth="1px"
                  borderColor="gray.200"
                  pt={2}
                  mt={1}
                >
                  <Flex justify="space-between" fontWeight="700">
                    <Text color="gray.800">Total (incl. VAT)</Text>
                    <Text color="blue.600">
                      {formatGBP(result.totalPrice)}
                    </Text>
                  </Flex>
                </Box>
              </VStack>
            </Box>

            {/* AI insights */}
            {result.aiConfidence != null && (
              <Box
                bg="green.50"
                borderRadius="lg"
                p={4}
                borderWidth="1px"
                borderColor="green.200"
              >
                <HStack gap={2} mb={1}>
                  <Badge colorPalette="green">AI Verified</Badge>
                  <Text fontSize="xs" color="gray.500">
                    Confidence: {result.aiConfidence}%
                  </Text>
                </HStack>
                {result.aiExplanation && (
                  <Text fontSize="sm" color="gray.700">
                    {result.aiExplanation}
                  </Text>
                )}
              </Box>
            )}

            {/* Warnings */}
            {result.aiWarnings && result.aiWarnings.length > 0 && (
              <Box
                bg="orange.50"
                borderRadius="lg"
                p={4}
                borderWidth="1px"
                borderColor="orange.200"
              >
                <Text
                  fontSize="sm"
                  fontWeight="700"
                  color="orange.700"
                  mb={1}
                >
                  Notes
                </Text>
                {result.aiWarnings.map((w, i) => (
                  <Text key={i} fontSize="sm" color="orange.800">
                    • {w}
                  </Text>
                ))}
              </Box>
            )}
          </VStack>
        )}
      </VStack>
    </Box>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Text fontSize="sm" fontWeight="600" color="gray.700" mb={1}>
        {label}
      </Text>
      {children}
    </Box>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <Button
      size="sm"
      variant={active ? "solid" : "outline"}
      colorPalette={active ? "blue" : "gray"}
      onClick={onClick}
      fontWeight="600"
    >
      {label}
    </Button>
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
