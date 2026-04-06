// ─── VanJet · SEO Site Constants ──────────────────────────────
// Single source of truth for brand, domain, and social handles.
// English only. No car transport.

const baseUrl =
  process.env.NEXT_PUBLIC_URL?.replace(/\/+$/, "") ||
  "http://localhost:3000";

export const SITE = {
  name: "VanJet",
  tagline: "Scotland's Trusted Man & Van Marketplace",
  domain: baseUrl.replace(/^https?:\/\//, ""),
  baseUrl,
  twitter: "@vanjet_uk",
  locale: "en-GB",
  country: "GB",
  currency: "GBP",
  phone: "0330 808 5678",
  email: "support@van-jet.com",
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

/** UK cities for SEO pages. Scottish cities PRIMARY, English cities SECONDARY. */
export const CITY_DATA: Record<
  string,
  { name: string; region: string; lat: number; lng: number; population: string; description?: string }
> = {
  // ═══════════════════════════════════════════════════════════════
  // SCOTTISH CITIES — PRIMARY MARKET
  // ═══════════════════════════════════════════════════════════════
  glasgow: {
    name: "Glasgow",
    region: "Scotland",
    lat: 55.8642,
    lng: -4.2518,
    population: "635,000",
    description: "Scotland's largest city",
  },
  edinburgh: {
    name: "Edinburgh",
    region: "Scotland",
    lat: 55.9533,
    lng: -3.1883,
    population: "527,000",
    description: "Scotland's capital",
  },
  paisley: {
    name: "Paisley",
    region: "Scotland",
    lat: 55.8456,
    lng: -4.4239,
    population: "77,000",
    description: "Renfrewshire's largest town",
  },
  "east-kilbride": {
    name: "East Kilbride",
    region: "Scotland",
    lat: 55.7644,
    lng: -4.1769,
    population: "75,000",
    description: "South Lanarkshire's largest town",
  },
  hamilton: {
    name: "Hamilton",
    region: "Scotland",
    lat: 55.7772,
    lng: -4.0396,
    population: "54,000",
    description: "South Lanarkshire",
  },
  motherwell: {
    name: "Motherwell",
    region: "Scotland",
    lat: 55.7894,
    lng: -3.9914,
    population: "32,000",
    description: "North Lanarkshire",
  },
  coatbridge: {
    name: "Coatbridge",
    region: "Scotland",
    lat: 55.8622,
    lng: -4.0267,
    population: "43,000",
    description: "North Lanarkshire",
  },
  cumbernauld: {
    name: "Cumbernauld",
    region: "Scotland",
    lat: 55.9456,
    lng: -3.9936,
    population: "52,000",
    description: "North Lanarkshire",
  },
  livingston: {
    name: "Livingston",
    region: "Scotland",
    lat: 55.9024,
    lng: -3.5225,
    population: "57,000",
    description: "West Lothian",
  },
  dunfermline: {
    name: "Dunfermline",
    region: "Scotland",
    lat: 56.0719,
    lng: -3.4393,
    population: "58,000",
    description: "Fife",
  },
  kirkcaldy: {
    name: "Kirkcaldy",
    region: "Scotland",
    lat: 56.1132,
    lng: -3.1584,
    population: "49,000",
    description: "Fife",
  },
  dundee: {
    name: "Dundee",
    region: "Scotland",
    lat: 56.4620,
    lng: -2.9707,
    population: "149,000",
    description: "City of Discovery",
  },
  aberdeen: {
    name: "Aberdeen",
    region: "Scotland",
    lat: 57.1499,
    lng: -2.0938,
    population: "229,000",
    description: "The Granite City",
  },
  stirling: {
    name: "Stirling",
    region: "Scotland",
    lat: 56.1165,
    lng: -3.9369,
    population: "37,000",
    description: "Gateway to the Highlands",
  },
  perth: {
    name: "Perth",
    region: "Scotland",
    lat: 56.3950,
    lng: -3.4308,
    population: "47,000",
    description: "Perth and Kinross",
  },
  inverness: {
    name: "Inverness",
    region: "Scotland",
    lat: 57.4778,
    lng: -4.2247,
    population: "63,000",
    description: "Capital of the Highlands",
  },
  ayr: {
    name: "Ayr",
    region: "Scotland",
    lat: 55.4583,
    lng: -4.6289,
    population: "46,000",
    description: "South Ayrshire",
  },
  falkirk: {
    name: "Falkirk",
    region: "Scotland",
    lat: 56.0019,
    lng: -3.7839,
    population: "40,000",
    description: "Falkirk district",
  },
  greenock: {
    name: "Greenock",
    region: "Scotland",
    lat: 55.9496,
    lng: -4.7644,
    population: "44,000",
    description: "Inverclyde",
  },
  kilmarnock: {
    name: "Kilmarnock",
    region: "Scotland",
    lat: 55.6111,
    lng: -4.4956,
    population: "46,000",
    description: "East Ayrshire",
  },
  // ═══════════════════════════════════════════════════════════════
  // ENGLISH CITIES — SECONDARY MARKET
  // ═══════════════════════════════════════════════════════════════
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
};

/** Major city-to-city route pairs for sitemap. Scottish routes prioritised. */
export const CITY_ROUTES = [
  // Scottish routes — PRIMARY
  ["glasgow", "edinburgh"],
  ["glasgow", "paisley"],
  ["glasgow", "east-kilbride"],
  ["glasgow", "hamilton"],
  ["glasgow", "dundee"],
  ["glasgow", "aberdeen"],
  ["edinburgh", "dundee"],
  ["edinburgh", "stirling"],
  ["edinburgh", "livingston"],
  ["edinburgh", "dunfermline"],
  ["aberdeen", "inverness"],
  ["dundee", "perth"],
  // English routes — SECONDARY
  ["london", "manchester"],
  ["london", "birmingham"],
  ["manchester", "leeds"],
  ["manchester", "liverpool"],
] as const;

/** Helper to check if a city is in Scotland */
export function isScottishCity(citySlug: string): boolean {
  const cityData = CITY_DATA[citySlug];
  return cityData?.region === "Scotland";
}

/** Get Scottish city slugs for footer/navigation */
export const SCOTTISH_CITY_SLUGS = Object.entries(CITY_DATA)
  .filter(([, data]) => data.region === "Scotland")
  .map(([slug]) => slug);

/** Get top Scottish cities for footer display */
export const TOP_SCOTTISH_CITIES = [
  "glasgow",
  "edinburgh",
  "dundee",
  "aberdeen",
  "paisley",
  "stirling",
  "perth",
  "inverness",
] as const;
