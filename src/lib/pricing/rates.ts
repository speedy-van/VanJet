// ─── VanJet · Pricing Rate Tables ─────────────────────────────
// All prices in GBP. English-only. No car/motorcycle transport.

/** Base price per job type (minimum starting cost). */
export const BASE_PRICES: Record<string, number> = {
  man_and_van: 45,
  furniture: 55,
  home_removal_studio: 180,
  home_removal_1bed: 250,
  home_removal_2bed: 350,
  home_removal_3bed: 480,
  home_removal_4bed: 650,
  home_removal_5bed: 850,
  piano_upright: 120,
  piano_grand: 250,
  student_move: 80,
  office_small: 300,
  office_medium: 550,
  office_large: 900,
  international_europe: 1200,
  storage_monthly: 60,
  single_item: 40,
  house_move: 280,
  office_move: 400,
  packing: 80,
  piano_specialist: 150,
  storage: 100,
};

/** Human-readable labels for job types. */
export const JOB_TYPE_LABELS: Record<string, string> = {
  man_and_van: "Man & Van",
  furniture: "Furniture Delivery",
  home_removal_studio: "Studio Flat Removal",
  home_removal_1bed: "1-Bed Removal",
  home_removal_2bed: "2-Bed Removal",
  home_removal_3bed: "3-Bed Removal",
  home_removal_4bed: "4-Bed Removal",
  home_removal_5bed: "5-Bed Removal",
  piano_upright: "Upright Piano Move",
  piano_grand: "Grand Piano Move",
  student_move: "Student Move",
  office_small: "Small Office Move",
  office_medium: "Medium Office Move",
  office_large: "Large Office Move",
  international_europe: "International (Europe)",
  storage_monthly: "Monthly Storage",
  single_item: "Single Item Delivery",
  house_move: "House Move",
  office_move: "Office Move",
  packing: "Packing Service",
  piano_specialist: "Specialist Item Move",
  storage: "Storage & Collection",
};

/** Distance rate tier structure */
export type DistanceRateTier = {
  upToMiles: number;
  ratePerMile: number;
};

export type DistanceRates = {
  tiers: DistanceRateTier[];
  minimumCharge: number;
  roundTripMultiplier: number;
};

/** Distance pricing tiers (per mile, one-way — round trip applied in engine). */
export const DISTANCE_RATES: DistanceRates = {
  tiers: [
    { upToMiles: 6, ratePerMile: 4.00 },
    { upToMiles: 31, ratePerMile: 2.90 },
    { upToMiles: 62, ratePerMile: 2.25 },
    { upToMiles: 186, ratePerMile: 1.75 },
    { upToMiles: Infinity, ratePerMile: 1.45 },
  ],
  minimumCharge: 15,
  roundTripMultiplier: 1.4, // driver returns partially loaded or empty
};

/** Competitive distance rates (marketplace-aligned, ~30% lower). */
export const DISTANCE_RATES_COMPETITIVE: DistanceRates = {
  tiers: [
    { upToMiles: 6, ratePerMile: 2.80 },   // -30%
    { upToMiles: 31, ratePerMile: 2.00 },  // -31%
    { upToMiles: 62, ratePerMile: 1.50 },  // -33%
    { upToMiles: 186, ratePerMile: 1.20 }, // -31%
    { upToMiles: Infinity, ratePerMile: 1.00 }, // -31%
  ],
  minimumCharge: 10,
  roundTripMultiplier: 1.0, // competitive = one-way pricing only
};

/** Vehicle types available in fleet. */
export type VehicleType =
  | "small_van"
  | "medium_van"
  | "lwb_van"
  | "luton_van"
  | "luton_tail_lift";

/** Vehicle capacity limits (volume and weight). */
export const VEHICLE_CAPACITY: Record<
  VehicleType,
  { volumeM3: number; weightKg: number; label: string }
> = {
  small_van: { volumeM3: 5, weightKg: 500, label: "Small Van (SWB)" },
  medium_van: { volumeM3: 9, weightKg: 900, label: "Medium Van (MWB)" },
  lwb_van: { volumeM3: 14, weightKg: 1200, label: "Large Van (LWB)" },
  luton_van: { volumeM3: 20, weightKg: 1500, label: "Luton Van" },
  luton_tail_lift: {
    volumeM3: 22,
    weightKg: 1800,
    label: "Luton Van with Tail Lift",
  },
};

/** Rate multiplier per vehicle (larger vehicle costs more). */
export const VEHICLE_MULTIPLIERS: Record<VehicleType, number> = {
  small_van: 1.0,
  medium_van: 1.15,
  lwb_van: 1.3,
  luton_van: 1.5,
  luton_tail_lift: 1.65,
};

/** Per-floor surcharge — only applies when no lift is available. */
export const FLOOR_CHARGES = {
  perFloor: 15, // £15 per floor without lift
  freeWithLift: true,
  maxFloorCharge: 75, // cap at 5 floors equivalent
} as const;

/** Extra service add-on prices. */
export const EXTRA_SERVICES = {
  packaging: { base: 30, perItem: 1.5, label: "Professional Packing" },
  assembly: { base: 25, perItem: 5, label: "Furniture Assembly" },
  disassembly: { base: 20, perItem: 5, label: "Furniture Disassembly" },
  cleaning: { flat: 80, label: "End-of-Tenancy Cleaning" },
  insurance_basic: { flat: 0, label: "Basic Cover (included)" },
  insurance_standard: { flat: 15, label: "Standard Cover (£10k)" },
  insurance_premium: { flat: 35, label: "Premium Cover (£25k)" },
} as const;

/** Demand multipliers for weekday/weekend/peak seasons. */
export const DEMAND_MULTIPLIERS = {
  dayOfWeek: {
    0: 1.15, // Sunday
    1: 0.95, // Monday
    2: 0.95, // Tuesday
    3: 1.0, // Wednesday
    4: 1.0, // Thursday
    5: 1.1, // Friday
    6: 1.2, // Saturday
  } as Record<number, number>,
  month: {
    1: 0.9, // January (quiet)
    2: 0.9,
    3: 0.95,
    4: 1.0,
    5: 1.05,
    6: 1.1, // Summer — busy
    7: 1.15,
    8: 1.15,
    9: 1.1, // Student season
    10: 1.0,
    11: 0.95,
    12: 0.9, // Holiday slowdown
  } as Record<number, number>,
  urgency: {
    sameDay: 1.5,
    nextDay: 1.3,
    within3Days: 1.15,
    within7Days: 1.05,
    standard: 1.0,
  },
} as const;

/**
 * Standard item weights/volumes for inline quick estimates.
 * All names in English. Keyed by common item name.
 */
export const STANDARD_ITEMS: Record<
  string,
  { weightKg: number; volumeM3: number; category: string }
> = {
  "Single bed": { weightKg: 30, volumeM3: 0.8, category: "Bedroom" },
  "Double bed": { weightKg: 50, volumeM3: 1.2, category: "Bedroom" },
  "King bed": { weightKg: 65, volumeM3: 1.5, category: "Bedroom" },
  Wardrobe: { weightKg: 60, volumeM3: 1.4, category: "Bedroom" },
  "Chest of drawers": { weightKg: 35, volumeM3: 0.5, category: "Bedroom" },
  "Bedside table": { weightKg: 10, volumeM3: 0.1, category: "Bedroom" },
  "Dressing table": { weightKg: 30, volumeM3: 0.4, category: "Bedroom" },
  "2-seater sofa": { weightKg: 45, volumeM3: 1.2, category: "Living Room" },
  "3-seater sofa": { weightKg: 65, volumeM3: 1.8, category: "Living Room" },
  "Corner sofa": { weightKg: 80, volumeM3: 2.5, category: "Living Room" },
  Armchair: { weightKg: 30, volumeM3: 0.7, category: "Living Room" },
  "Coffee table": { weightKg: 15, volumeM3: 0.3, category: "Living Room" },
  "TV stand": { weightKg: 20, volumeM3: 0.3, category: "Living Room" },
  Bookcase: { weightKg: 30, volumeM3: 0.6, category: "Living Room" },
  "Dining table (4-seater)": {
    weightKg: 30,
    volumeM3: 0.6,
    category: "Dining Room",
  },
  "Dining table (6-seater)": {
    weightKg: 45,
    volumeM3: 0.9,
    category: "Dining Room",
  },
  "Dining chair": { weightKg: 6, volumeM3: 0.15, category: "Dining Room" },
  Sideboard: { weightKg: 40, volumeM3: 0.5, category: "Dining Room" },
  "Washing machine": {
    weightKg: 70,
    volumeM3: 0.35,
    category: "Appliances",
  },
  "Fridge freezer": { weightKg: 65, volumeM3: 0.5, category: "Appliances" },
  Dishwasher: { weightKg: 45, volumeM3: 0.3, category: "Appliances" },
  "Tumble dryer": { weightKg: 35, volumeM3: 0.3, category: "Appliances" },
  Microwave: { weightKg: 12, volumeM3: 0.05, category: "Appliances" },
  "Office desk": { weightKg: 30, volumeM3: 0.6, category: "Office" },
  "Office chair": { weightKg: 12, volumeM3: 0.3, category: "Office" },
  "Filing cabinet": { weightKg: 25, volumeM3: 0.2, category: "Office" },
  "Upright piano": { weightKg: 200, volumeM3: 0.8, category: "Specialist" },
  "Grand piano": { weightKg: 350, volumeM3: 2.5, category: "Specialist" },
  "Treadmill": { weightKg: 80, volumeM3: 0.5, category: "Gym Equipment" },
  "Exercise bike": { weightKg: 30, volumeM3: 0.3, category: "Gym Equipment" },
  "Moving box (small)": { weightKg: 8, volumeM3: 0.03, category: "Boxes" },
  "Moving box (medium)": { weightKg: 15, volumeM3: 0.06, category: "Boxes" },
  "Moving box (large)": { weightKg: 20, volumeM3: 0.1, category: "Boxes" },
};

/** VAT rate for UK removals sector. */
export const VAT_RATE = 0.2;

/**
 * Platform fee rate. Returns 0 when ZERO_COMMISSION_MODE is enabled.
 * @deprecated Use getPlatformFeeRate() for runtime value.
 */
export const PLATFORM_FEE_RATE = 0;

/** Get current platform fee rate (0 in zero commission mode). */
export function getPlatformFeeRate(): number {
  // Zero commission mode: drivers keep 100%
  return 0;
}
