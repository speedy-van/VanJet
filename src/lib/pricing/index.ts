// ─── VanJet · Pricing Module Barrel Export ────────────────────
// Re-exports all pricing components for clean imports.

export { calculatePrice } from "./engine";
export type { PricingInput, PricingBreakdown, PricingItemInput, BreakdownLine } from "./engine";
export {
  calculateDistanceCost,
  calculateFloorCost,
  calculateDemandMultiplier,
  recommendVehicle,
  estimateDuration,
} from "./engine";

export { validatePriceWithGrok, quickEstimate } from "./grok-validator";
export type { GrokValidationResult } from "./grok-validator";

export {
  getAcceptanceAdjustment,
  getSeasonalCorrection,
  recordQuoteOutcome,
} from "./history";

export {
  BASE_PRICES,
  JOB_TYPE_LABELS,
  DISTANCE_RATES,
  VEHICLE_CAPACITY,
  VEHICLE_MULTIPLIERS,
  FLOOR_CHARGES,
  EXTRA_SERVICES,
  DEMAND_MULTIPLIERS,
  STANDARD_ITEMS,
  VAT_RATE,
} from "./rates";
export type { VehicleType } from "./rates";
