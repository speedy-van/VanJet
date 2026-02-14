// ─── VanJet · SEO Site Constants ──────────────────────────────
// Single source of truth for brand, domain, and social handles.
// English only. No car transport.

const baseUrl =
  process.env.NEXT_PUBLIC_URL?.replace(/\/+$/, "") ||
  "http://localhost:3000";

export const SITE = {
  name: "VanJet",
  tagline: "UK Removal & Delivery Marketplace",
  domain: baseUrl.replace(/^https?:\/\//, ""),
  baseUrl,
  twitter: "@vanjet_uk",
  locale: "en-GB",
  country: "GB",
  currency: "GBP",
  phone: "+44 1202 129746",
  email: "hello@van-jet.com",
  address: {
    street: "71-75 Shelton Street",
    city: "London",
    region: "Greater London",
    postalCode: "WC2H 9JQ",
    country: "GB",
  },
} as const;

/** High-value services for programmatic SEO pages. No car/motorcycle. */
export const VALID_SERVICES = [
  "man-and-van",
  "house-removals",
  "furniture-delivery",
  "office-removals",
] as const;

export type ValidService = (typeof VALID_SERVICES)[number];

export const SERVICE_META: Record<
  ValidService,
  { title: string; description: string; h1: string; schema: string }
> = {
  "man-and-van": {
    title: "Man and Van",
    description:
      "Affordable man and van hire across the UK. Instant quotes, verified drivers, flexible bookings.",
    h1: "Man and Van Services",
    schema: "MovingCompany",
  },
  "house-removals": {
    title: "House Removals",
    description:
      "Professional house removal services. Door-to-door, fully insured moves with real-time tracking.",
    h1: "House Removal Services",
    schema: "MovingCompany",
  },
  "furniture-delivery": {
    title: "Furniture Delivery",
    description:
      "Safe furniture delivery and collection. Sofas, beds, wardrobes — handled with care.",
    h1: "Furniture Delivery Services",
    schema: "DeliveryService",
  },
  "office-removals": {
    title: "Office Removals",
    description:
      "Efficient office and commercial relocations. Minimal downtime, weekend availability.",
    h1: "Office Removal Services",
    schema: "MovingCompany",
  },
};

/** All service types for the sitemap (wider set). No car/motorcycle. */
export const ALL_SERVICE_SLUGS = [
  "man-and-van",
  "house-removals",
  "furniture-delivery",
  "piano-movers",
  "student-removals",
  "office-removals",
  "storage",
  "international-removals",
] as const;

/** UK cities for SEO pages. */
export const CITY_DATA: Record<
  string,
  { name: string; region: string; lat: number; lng: number; population: string }
> = {
  london: {
    name: "London",
    region: "Greater London",
    lat: 51.5074,
    lng: -0.1278,
    population: "9 million",
  },
  manchester: {
    name: "Manchester",
    region: "Greater Manchester",
    lat: 53.4808,
    lng: -2.2426,
    population: "550,000",
  },
  birmingham: {
    name: "Birmingham",
    region: "West Midlands",
    lat: 52.4862,
    lng: -1.8904,
    population: "1.1 million",
  },
  leeds: {
    name: "Leeds",
    region: "West Yorkshire",
    lat: 53.8008,
    lng: -1.5491,
    population: "800,000",
  },
  glasgow: {
    name: "Glasgow",
    region: "Scotland",
    lat: 55.8642,
    lng: -4.2518,
    population: "635,000",
  },
  liverpool: {
    name: "Liverpool",
    region: "Merseyside",
    lat: 53.4084,
    lng: -2.9916,
    population: "500,000",
  },
  bristol: {
    name: "Bristol",
    region: "South West England",
    lat: 51.4545,
    lng: -2.5879,
    population: "467,000",
  },
  edinburgh: {
    name: "Edinburgh",
    region: "Scotland",
    lat: 55.9533,
    lng: -3.1883,
    population: "527,000",
  },
  sheffield: {
    name: "Sheffield",
    region: "South Yorkshire",
    lat: 53.3811,
    lng: -1.4701,
    population: "584,000",
  },
  nottingham: {
    name: "Nottingham",
    region: "East Midlands",
    lat: 52.9548,
    lng: -1.1581,
    population: "330,000",
  },
  // TODO: Expand to 40 cities (Cardiff, Newcastle, Brighton, Oxford, etc.)
};

/** Major city-to-city route pairs for sitemap. */
export const CITY_ROUTES = [
  ["london", "manchester"],
  ["london", "birmingham"],
  ["london", "bristol"],
  ["london", "leeds"],
  ["london", "edinburgh"],
  ["manchester", "leeds"],
  ["manchester", "liverpool"],
  ["birmingham", "nottingham"],
  ["glasgow", "edinburgh"],
  ["bristol", "london"],
] as const;
