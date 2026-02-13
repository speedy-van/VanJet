// ─── VanJet · Rules-Based Pricing Engine ──────────────────────
// Deterministic pricing: base + distance + floors + extras + demand.
// English only. No car/motorcycle transport.

import {
  BASE_PRICES,
  DISTANCE_RATES,
  VEHICLE_CAPACITY,
  VEHICLE_MULTIPLIERS,
  FLOOR_CHARGES,
  EXTRA_SERVICES,
  DEMAND_MULTIPLIERS,
  VAT_RATE,
  PLATFORM_FEE_RATE,
  JOB_TYPE_LABELS,
} from "./rates";
import type { VehicleType } from "./rates";

// ── Types ──────────────────────────────────────────────────────

export interface PricingItemInput {
  name: string;
  quantity: number;
  weightKg: number;
  volumeM3: number;
}

export interface PricingInput {
  jobType: string;
  distanceKm: number;
  items: PricingItemInput[];
  pickupFloor: number;
  pickupHasElevator: boolean;
  deliveryFloor: number;
  deliveryHasElevator: boolean;
  requiresPackaging: boolean;
  requiresAssembly: boolean;
  requiresDisassembly: boolean;
  requiresCleaning: boolean;
  insuranceLevel: "basic" | "standard" | "premium";
  preferredDate: Date;
  requestedAt: Date;
  numberOfMovers?: number;
}

export interface BreakdownLine {
  label: string;
  amount: number;
}

export interface PricingBreakdown {
  basePrice: number;
  distanceCost: number;
  floorCost: number;
  extraServices: number;
  demandMultiplier: number;
  vehicleMultiplier: number;
  subtotal: number;
  platformFee: number; // hidden from customer
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
}

// ── Helpers ────────────────────────────────────────────────────

/** Calculate tiered distance cost (one-way km, then apply round-trip multiplier). */
export function calculateDistanceCost(distanceKm: number): number {
  let cost = 0;
  let remaining = distanceKm;

  for (const tier of DISTANCE_RATES.tiers) {
    if (remaining <= 0) break;
    const prevLimit =
      DISTANCE_RATES.tiers.indexOf(tier) > 0
        ? DISTANCE_RATES.tiers[DISTANCE_RATES.tiers.indexOf(tier) - 1].upToKm
        : 0;
    const tierRange = Math.min(remaining, tier.upToKm - prevLimit);
    cost += tierRange * tier.ratePerKm;
    remaining -= tierRange;
  }

  // Round-trip adjustment (driver has to return)
  cost *= DISTANCE_RATES.roundTripMultiplier;

  return Math.max(cost, DISTANCE_RATES.minimumCharge);
}

/** Recommend vehicle type based on total volume and weight. Returns type + count. */
export function recommendVehicle(
  totalVolumeM3: number,
  totalWeightKg: number
): { vehicle: VehicleType; count: number } {
  const types: VehicleType[] = [
    "small_van",
    "medium_van",
    "lwb_van",
    "luton_van",
    "luton_tail_lift",
  ];

  // Try to fit in one vehicle first
  for (const v of types) {
    const cap = VEHICLE_CAPACITY[v];
    if (totalVolumeM3 <= cap.volumeM3 && totalWeightKg <= cap.weightKg) {
      return { vehicle: v, count: 1 };
    }
  }

  // Need multiple trips — use largest vehicle
  const largest: VehicleType = "luton_tail_lift";
  const cap = VEHICLE_CAPACITY[largest];
  const byVol = Math.ceil(totalVolumeM3 / cap.volumeM3);
  const byWt = Math.ceil(totalWeightKg / cap.weightKg);
  return { vehicle: largest, count: Math.max(byVol, byWt, 1) };
}

/** Calculate floor surcharge for both pickup and delivery. */
export function calculateFloorCost(
  pickupFloor: number,
  pickupHasElevator: boolean,
  deliveryFloor: number,
  deliveryHasElevator: boolean
): number {
  let cost = 0;
  if (pickupFloor > 0 && !pickupHasElevator) {
    cost += Math.min(
      pickupFloor * FLOOR_CHARGES.perFloor,
      FLOOR_CHARGES.maxFloorCharge
    );
  }
  if (deliveryFloor > 0 && !deliveryHasElevator) {
    cost += Math.min(
      deliveryFloor * FLOOR_CHARGES.perFloor,
      FLOOR_CHARGES.maxFloorCharge
    );
  }
  return cost;
}

/** Calculate demand multiplier based on date, day-of-week, and urgency. */
export function calculateDemandMultiplier(
  preferredDate: Date,
  requestedAt: Date
): number {
  const dayMult =
    DEMAND_MULTIPLIERS.dayOfWeek[preferredDate.getDay()] ?? 1.0;
  const monthMult =
    DEMAND_MULTIPLIERS.month[preferredDate.getMonth() + 1] ?? 1.0;

  // Urgency based on lead time
  const leadMs = preferredDate.getTime() - requestedAt.getTime();
  const leadDays = leadMs / (1000 * 60 * 60 * 24);
  let urgencyMult: number;
  if (leadDays < 1) urgencyMult = DEMAND_MULTIPLIERS.urgency.sameDay;
  else if (leadDays < 2) urgencyMult = DEMAND_MULTIPLIERS.urgency.nextDay;
  else if (leadDays < 4)
    urgencyMult = DEMAND_MULTIPLIERS.urgency.within3Days;
  else if (leadDays < 8)
    urgencyMult = DEMAND_MULTIPLIERS.urgency.within7Days;
  else urgencyMult = DEMAND_MULTIPLIERS.urgency.standard;

  return dayMult * monthMult * urgencyMult;
}

/** Estimate job duration in hours. */
export function estimateDuration(
  totalItems: number,
  pickupFloor: number,
  deliveryFloor: number,
  distanceKm: number
): number {
  const loadingMinutes = Math.max(totalItems * 5, 20); // 5 min per item, min 20
  const unloadingMinutes = Math.max(totalItems * 4, 15);
  const floorTime = (pickupFloor + deliveryFloor) * 3; // 3 min per floor level
  const drivingMinutes = (distanceKm / 40) * 60; // average 40 km/h in UK
  const totalMinutes =
    loadingMinutes + unloadingMinutes + floorTime + drivingMinutes;
  return Math.round((totalMinutes / 60) * 10) / 10; // 1 decimal
}

/** Calculate extra service costs. */
function calculateExtraServices(
  input: PricingInput,
  totalItems: number
): { cost: number; lines: BreakdownLine[] } {
  let cost = 0;
  const lines: BreakdownLine[] = [];

  if (input.requiresPackaging) {
    const packCost =
      EXTRA_SERVICES.packaging.base +
      totalItems * EXTRA_SERVICES.packaging.perItem;
    cost += packCost;
    lines.push({ label: EXTRA_SERVICES.packaging.label, amount: packCost });
  }
  if (input.requiresAssembly) {
    const asmCost =
      EXTRA_SERVICES.assembly.base +
      totalItems * EXTRA_SERVICES.assembly.perItem;
    cost += asmCost;
    lines.push({ label: EXTRA_SERVICES.assembly.label, amount: asmCost });
  }
  if (input.requiresDisassembly) {
    const disCost =
      EXTRA_SERVICES.disassembly.base +
      totalItems * EXTRA_SERVICES.disassembly.perItem;
    cost += disCost;
    lines.push({ label: EXTRA_SERVICES.disassembly.label, amount: disCost });
  }
  if (input.requiresCleaning) {
    cost += EXTRA_SERVICES.cleaning.flat;
    lines.push({
      label: EXTRA_SERVICES.cleaning.label,
      amount: EXTRA_SERVICES.cleaning.flat,
    });
  }

  // Insurance
  const insKey = `insurance_${input.insuranceLevel}` as keyof typeof EXTRA_SERVICES;
  const ins = EXTRA_SERVICES[insKey];
  if (ins && "flat" in ins && ins.flat > 0) {
    cost += ins.flat;
    lines.push({ label: ins.label, amount: ins.flat });
  }

  return { cost, lines };
}

// ── Main Engine ────────────────────────────────────────────────

/** Calculate a deterministic price for a removal job. */
export function calculatePrice(input: PricingInput): PricingBreakdown {
  // Aggregate items
  const totalVolumeM3 = input.items.reduce(
    (s, i) => s + i.volumeM3 * i.quantity,
    0
  );
  const totalWeightKg = input.items.reduce(
    (s, i) => s + i.weightKg * i.quantity,
    0
  );
  const totalItems = input.items.reduce((s, i) => s + i.quantity, 0);

  // Base
  const basePrice = BASE_PRICES[input.jobType] ?? BASE_PRICES.man_and_van;

  // Distance
  const distanceCost = calculateDistanceCost(input.distanceKm);

  // Floor
  const floorCost = calculateFloorCost(
    input.pickupFloor,
    input.pickupHasElevator,
    input.deliveryFloor,
    input.deliveryHasElevator
  );

  // Extras
  const extras = calculateExtraServices(input, totalItems);

  // Vehicle recommendation
  const { vehicle, count } = recommendVehicle(totalVolumeM3, totalWeightKg);
  const vehicleMult = VEHICLE_MULTIPLIERS[vehicle] * count;

  // Demand
  const demandMult = calculateDemandMultiplier(
    input.preferredDate,
    input.requestedAt
  );

  // Subtotal before multipliers
  const rawSubtotal = basePrice + distanceCost + floorCost + extras.cost;
  const subtotal = rawSubtotal * vehicleMult * demandMult;

  // VAT
  const vatAmount = subtotal * VAT_RATE;
  const totalPrice = subtotal + vatAmount;

  // Platform fee (hidden, taken from driver)
  const platformFee = subtotal * PLATFORM_FEE_RATE;

  // Price range (±15%, rounded to nearest £5)
  const priceMin = roundTo5(totalPrice * 0.85);
  const priceMax = roundTo5(totalPrice * 1.15);

  // Duration
  const estimatedDurationHours = estimateDuration(
    totalItems,
    input.pickupFloor,
    input.deliveryFloor,
    input.distanceKm
  );

  // Build breakdown
  const breakdown: BreakdownLine[] = [
    {
      label: `Base price (${JOB_TYPE_LABELS[input.jobType] ?? input.jobType})`,
      amount: basePrice,
    },
    { label: `Distance (${input.distanceKm.toFixed(1)} km)`, amount: distanceCost },
  ];
  if (floorCost > 0) {
    breakdown.push({ label: "Floor access surcharge", amount: floorCost });
  }
  breakdown.push(...extras.lines);
  if (vehicleMult !== 1) {
    breakdown.push({
      label: `Vehicle: ${VEHICLE_CAPACITY[vehicle].label}${count > 1 ? ` ×${count}` : ""}`,
      amount: rawSubtotal * (vehicleMult - 1),
    });
  }
  if (demandMult !== 1) {
    breakdown.push({
      label: `Demand adjustment (×${demandMult.toFixed(2)})`,
      amount: rawSubtotal * vehicleMult * (demandMult - 1),
    });
  }
  breakdown.push({ label: "VAT (20%)", amount: vatAmount });

  return {
    basePrice,
    distanceCost,
    floorCost,
    extraServices: extras.cost,
    demandMultiplier: Math.round(demandMult * 100) / 100,
    vehicleMultiplier: Math.round(vehicleMult * 100) / 100,
    subtotal: round2(subtotal),
    platformFee: round2(platformFee),
    vatAmount: round2(vatAmount),
    totalPrice: round2(totalPrice),
    recommendedVehicle: VEHICLE_CAPACITY[vehicle].label,
    totalVolumeM3: Math.round(totalVolumeM3 * 100) / 100,
    totalWeightKg: Math.round(totalWeightKg * 100) / 100,
    numberOfVehicles: count,
    estimatedDurationHours,
    priceMin,
    priceMax,
    breakdown,
  };
}

// ── Utilities ──────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function roundTo5(n: number): number {
  return Math.round(n / 5) * 5;
}
