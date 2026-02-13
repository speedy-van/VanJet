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
  // Step 1: Pickup
  pickup: AddressData;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  // Step 2: Drop-off
  dropoff: AddressData;
  // Step 3: Items
  items: BookingItem[];
  needsPacking: boolean;
  // Step 4: Schedule
  schedule: ScheduleData;
  // Step 5: Review (computed)
  jobType: string;
  // Step 6: Payment
  jobId?: string;
  estimatedPrice?: number;
  priceRange?: { min: number; max: number };
  distanceKm?: number;
  durationMinutes?: number;
  bookingId?: string;
}

export const TIME_WINDOWS = [
  { value: "08-10", label: "08:00 – 10:00" },
  { value: "10-12", label: "10:00 – 12:00" },
  { value: "12-14", label: "12:00 – 14:00" },
  { value: "14-16", label: "14:00 – 16:00" },
  { value: "16-18", label: "16:00 – 18:00" },
] as const;

export const WIZARD_STEPS = [
  "Pickup",
  "Drop-off",
  "Items",
  "Schedule",
  "Review",
  "Payment",
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
