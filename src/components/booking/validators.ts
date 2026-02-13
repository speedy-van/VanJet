// ─── VanJet · Booking Wizard Validators ──────────────────────
import * as yup from "yup";

export const pickupSchema = yup.object({
  pickup: yup.object({
    address: yup.string().required("Pickup address is required."),
    lat: yup.number().required(),
    lng: yup.number().required(),
    floor: yup.number().min(0).default(0),
    flat: yup.string().default(""),
    hasLift: yup.boolean().default(false),
    notes: yup.string().default(""),
  }),
  contactName: yup.string().default(""),
  contactPhone: yup.string().default(""),
});

export const dropoffSchema = yup.object({
  dropoff: yup.object({
    address: yup.string().required("Delivery address is required."),
    lat: yup.number().required(),
    lng: yup.number().required(),
    floor: yup.number().min(0).default(0),
    flat: yup.string().default(""),
    hasLift: yup.boolean().default(false),
    notes: yup.string().default(""),
  }),
});

export const itemsSchema = yup.object({
  items: yup
    .array()
    .min(1, "Add at least one item.")
    .required("At least one item is required."),
  needsPacking: yup.boolean().default(false),
});

export const scheduleSchema = yup.object({
  schedule: yup.object({
    preferredDate: yup.string().required("Please select a date."),
    timeWindow: yup.string().required("Please select a time window."),
    flexibleDates: yup.boolean().default(false),
  }),
});
