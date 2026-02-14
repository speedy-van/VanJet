// ─── VanJet · Booking Wizard Types ───────────────────────────
import type { UseFormReturn } from "react-hook-form";

export interface AddressData {
  address: string;
  lat: number;
  lng: number;
  floor: number;
  flat: string;
  hasLift: boolean;
  notes: string;
  // Address confirmation tracking
  confirmed: boolean;
  precision: "full" | "postcode" | "unknown";
}

export interface BookingItem {
  id: string; // catalog id or "custom_<idx>"
  name: string;
  category: string;
  quantity: number;
  weightKg: number;
  volumeM3: number;
  fragile: boolean;
  notes: string;
  isCustom: boolean;
}

export interface ScheduleData {
  preferredDate: string; // ISO date
  timeWindow: string; // "08-10" | "10-12" | "12-14" | "14-16" | "16-18"
  flexibleDates: boolean;
}

export interface BookingFormData {
  // Step 1: Addresses (Pickup + Drop-off)
  pickup: AddressData;
  dropoff: AddressData;
  // Step 2: Items
  items: BookingItem[];
  needsPacking: boolean;
  // Step 3: Schedule
  schedule: ScheduleData;
  // Step 4: Review (contact captured here + computed pricing)
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  jobType: string;
  // Step 5: Payment
  jobId?: string;
  referenceNumber?: string;
  estimatedPrice?: number;
  priceRange?: { min: number; max: number };
  distanceMiles?: number;
  durationMinutes?: number;
  bookingId?: string;
  trackingToken?: string;
}

export const TIME_WINDOWS = [
  { value: "08-10", label: "08:00 – 10:00" },
  { value: "10-12", label: "10:00 – 12:00" },
  { value: "12-14", label: "12:00 – 14:00" },
  { value: "14-16", label: "14:00 – 16:00" },
  { value: "16-18", label: "16:00 – 18:00" },
] as const;

export const WIZARD_STEPS = [
  "Addresses",
  "Items",
  "Schedule",
  "Review",
  "Confirmed",
] as const;

export type WizardStep = (typeof WIZARD_STEPS)[number];

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  weight: number;
  volume: number;
  dimensions: string;
  workers_required: number;
  fragility_level: string;
  special_handling_notes: string;
  image: string;
}

export type BookingForm = UseFormReturn<BookingFormData>;
