// ─── VanJet · Booking Wizard State Helpers ───────────────────
// The wizard uses react-hook-form for state management.
// This file exports typed helpers and state shape for use across steps.

import type { UseFormReturn } from "react-hook-form";
import type { BookingFormData } from "../types";

/**
 * The wizard state shape.
 * Mirrors BookingFormData but adds runtime info for step tracking.
 */
export interface BookingWizardState {
  /** Current step index (0-based) */
  currentStep: number;
  /** Form data */
  data: BookingFormData;
  /** Field-level errors (path → message) */
  errors: Record<string, string>;
  /** Whether the pricing API is in flight */
  isSubmitting: boolean;
  /** Last auto-save timestamp (ISO string) */
  lastSavedAt: string | null;
  /** Steps that have been completed */
  completedSteps: number[];
}

/**
 * Step metadata for the stepper component.
 */
export interface WizardStepMeta {
  key: string;
  titleKey: string;
  descriptionKey?: string;
}

export const WIZARD_STEP_META: WizardStepMeta[] = [
  { key: "addresses", titleKey: "booking.steps.addresses", descriptionKey: "booking.steps.addressesDesc" },
  { key: "items", titleKey: "booking.steps.items", descriptionKey: "booking.steps.itemsDesc" },
  { key: "schedule", titleKey: "booking.steps.schedule", descriptionKey: "booking.steps.scheduleDesc" },
  { key: "review", titleKey: "booking.steps.review", descriptionKey: "booking.steps.reviewDesc" },
];

/**
 * Type alias for the booking form return value.
 */
export type BookingFormReturn = UseFormReturn<BookingFormData>;

/**
 * Extract current wizard state from form.
 */
export function getWizardState(
  form: BookingFormReturn,
  currentStep: number,
  completedSteps: number[],
  isSubmitting: boolean,
  lastSavedAt: string | null
): BookingWizardState {
  const data = form.getValues();
  const errors: Record<string, string> = {};

  // Flatten form errors to path → message map
  Object.entries(form.formState.errors).forEach(([key, value]) => {
    if (value && typeof value === "object" && "message" in value) {
      errors[key] = String(value.message);
    }
  });

  return {
    currentStep,
    data,
    errors,
    isSubmitting,
    lastSavedAt,
    completedSteps,
  };
}

/**
 * Check if a step is complete based on required fields.
 */
export function isStepComplete(data: BookingFormData, stepIndex: number): boolean {
  switch (stepIndex) {
    case 0: // Addresses
      return (
        !!data.pickup.address &&
        !!data.pickup.lat &&
        !!data.dropoff.address &&
        !!data.dropoff.lat
      );
    case 1: // Items
      return data.items.length > 0;
    case 2: // Schedule
      return !!data.schedule.preferredDate && !!data.schedule.timeWindow;
    case 3: // Review
      return (
        !!data.contactName?.trim() &&
        !!data.contactEmail?.trim() &&
        !!data.contactPhone?.trim()
      );
    default:
      return false;
  }
}

/**
 * Get all completed step indices based on current form data.
 */
export function getCompletedSteps(data: BookingFormData): number[] {
  const completed: number[] = [];
  for (let i = 0; i < 4; i++) {
    if (isStepComplete(data, i)) {
      completed.push(i);
    }
  }
  return completed;
}
