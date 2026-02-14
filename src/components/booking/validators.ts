// ─── VanJet · Booking Wizard Validators ──────────────────────
import * as yup from "yup";

export const addressesSchema = yup.object({
  pickup: yup.object({
    address: yup.string().required("Pickup address is required."),
    lat: yup.number().required(),
    lng: yup.number().required(),
    floor: yup.number().min(0).default(0),
    flat: yup.string().default(""),
    hasLift: yup.boolean().default(false),
    notes: yup.string().default(""),
  }),
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

export const contactSchema = yup.object({
  contactName: yup.string().required("Full name is required.").trim(),
  contactEmail: yup
    .string()
    .required("Email address is required.")
    .email("Please enter a valid email address.")
    .trim(),
  contactPhone: yup.string().required("Phone number is required.").trim(),
});
