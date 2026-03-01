// ─── VanJet · Pillar Items for Modern SEO ────────────────────
// 22 high-quality pillar pages covering core removal demand.
// Only these items have dedicated pages. All others are found in /items directory.

export interface PillarItemMeta {
  slug: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  relatedServices: string[]; // Service slugs
}

export const PILLAR_ITEMS: Record<string, PillarItemMeta> = {
  sofa: {
    slug: "sofa",
    title: "Sofa Removal & Delivery",
    description:
      "Professional sofa removal and delivery service. Safe transport for sofas across the UK with full insurance cover.",
    category: "Living Room Furniture",
    icon: "🛋️",
    relatedServices: ["furniture-delivery", "man-and-van", "house-removals"],
  },
  "corner-sofa": {
    slug: "corner-sofa",
    title: "Corner Sofa Removal & Delivery",
    description:
      "Specialist removal service for large corner sofas and modular seating. Expert handling of complex pieces.",
    category: "Living Room Furniture",
    icon: "🛋️",
    relatedServices: ["furniture-delivery", "house-removals", "man-and-van"],
  },
  armchair: {
    slug: "armchair",
    title: "Armchair Removal & Delivery",
    description:
      "Fast and affordable armchair removal. Single and reclining chairs transported safely across the UK.",
    category: "Living Room Furniture",
    icon: "🪑",
    relatedServices: ["furniture-delivery", "man-and-van"],
  },
  "bed-frame": {
    slug: "bed-frame",
    title: "Bed Frame Removal & Delivery",
    description:
      "Safe bed frame removal and assembly. All sizes: single, double, queen, king. Disassembly and reassembly included.",
    category: "Bedroom Furniture",
    icon: "🛏️",
    relatedServices: ["furniture-delivery", "house-removals", "man-and-van"],
  },
  mattress: {
    slug: "mattress",
    title: "Mattress Removal & Delivery",
    description:
      "Professional mattress removal and delivery. Wrapped protection, safe handling of all types: memory foam, spring, hybrid.",
    category: "Bedroom Furniture",
    icon: "🛏️",
    relatedServices: ["furniture-delivery", "man-and-van"],
  },
  wardrobe: {
    slug: "wardrobe",
    title: "Wardrobe & Cabinet Removal",
    description:
      "Expert wardrobe removal and delivery. Fitted, freestanding, and built-in wardrobes handled with care.",
    category: "Bedroom Furniture",
    icon: "🚪",
    relatedServices: ["furniture-delivery", "house-removals", "man-and-van"],
  },
  "chest-of-drawers": {
    slug: "chest-of-drawers",
    title: "Chest of Drawers Removal",
    description:
      "Safe removal of chests, dressers, and drawer units. Disassembly and reassembly service available.",
    category: "Bedroom Furniture",
    icon: "🗄️",
    relatedServices: ["furniture-delivery", "house-removals", "man-and-van"],
  },
  "dining-table": {
    slug: "dining-table",
    title: "Dining Table Removal & Delivery",
    description:
      "Professional removal of dining tables: wooden, glass, marble, and extending tables. Expert packing and transportation.",
    category: "Dining Furniture",
    icon: "🍽️",
    relatedServices: ["furniture-delivery", "house-removals", "man-and-van"],
  },
  desk: {
    slug: "desk",
    title: "Desk & Workstation Removal",
    description:
      "Office desk and home workstation removal. Disassembly, transportation, and reassembly of desks and office furniture.",
    category: "Office Furniture",
    icon: "💼",
    relatedServices: ["office-removals", "man-and-van", "furniture-delivery"],
  },
  bookcase: {
    slug: "bookcase",
    title: "Bookcase Removal & Moving",
    description:
      "Safe removal of bookcases and shelving units. Disassembly of freestanding and built-in shelving systems.",
    category: "Storage Furniture",
    icon: "📚",
    relatedServices: ["furniture-delivery", "house-removals", "man-and-van"],
  },
  tv: {
    slug: "tv",
    title: "Television & Screen Removal",
    description:
      "Specialist TV and large screen removal. Careful handling of flat-screen, curved, and large-format displays.",
    category: "Electronics",
    icon: "📺",
    relatedServices: ["furniture-delivery", "man-and-van", "house-removals"],
  },
  "fridge-freezer": {
    slug: "fridge-freezer",
    title: "Fridge & Freezer Removal & Delivery",
    description:
      "Safe refrigerator and freezer removal. Expert handling with proper drainage, disconnection, and delivery setup.",
    category: "Kitchen Appliances",
    icon: "❄️",
    relatedServices: ["furniture-delivery", "man-and-van", "house-removals"],
  },
  "washing-machine": {
    slug: "washing-machine",
    title: "Washing Machine Removal & Installation",
    description:
      "Professional washing machine removal and delivery. Includes disconnection, transportation, and installation guidance.",
    category: "Kitchen Appliances",
    icon: "🧺",
    relatedServices: ["furniture-delivery", "man-and-van", "house-removals"],
  },
  dishwasher: {
    slug: "dishwasher",
    title: "Dishwasher Removal & Delivery",
    description:
      "Safe dishwasher removal and relocation. Expert disconnection and careful transportation of integrated and freestanding models.",
    category: "Kitchen Appliances",
    icon: "🍽️",
    relatedServices: ["furniture-delivery", "man-and-van", "house-removals"],
  },
  "cooker-oven": {
    slug: "cooker-oven",
    title: "Cooker & Oven Removal",
    description:
      "Professional cooker and oven removal. Safe disconnection and expert handling of gas and electric ranges.",
    category: "Kitchen Appliances",
    icon: "🔥",
    relatedServices: ["furniture-delivery", "house-removals", "man-and-van"],
  },
  piano: {
    slug: "piano",
    title: "Piano Removal & Transportation",
    description:
      "Specialist piano removal service. Acoustic, grand, and digital pianos moved by certified professionals with full insurance.",
    category: "Specialist Items",
    icon: "🎹",
    relatedServices: ["furniture-delivery", "house-removals"],
  },
  safe: {
    slug: "safe",
    title: "Safe & Security Box Removal",
    description:
      "Specialist removal of safes, security boxes, and heavy storage units. Expert equipment and secure handling.",
    category: "Specialist Items",
    icon: "🔒",
    relatedServices: ["furniture-delivery", "house-removals", "man-and-van"],
  },
  mirror: {
    slug: "mirror",
    title: "Mirror & Glass Removal",
    description:
      "Careful removal of mirrors, glass furniture, and glazed units. Expert packing protects against breakage.",
    category: "Decorative Items",
    icon: "🪞",
    relatedServices: ["furniture-delivery", "man-and-van"],
  },
  artwork: {
    slug: "artwork",
    title: "Artwork & Painting Removal",
    description:
      "Specialist removal of artwork, paintings, and wall hangings. Protective handling with acid-free packing.",
    category: "Decorative Items",
    icon: "🎨",
    relatedServices: ["furniture-delivery", "man-and-van", "house-removals"],
  },
  treadmill: {
    slug: "treadmill",
    title: "Treadmill & Exercise Equipment Removal",
    description:
      "Safe removal of treadmills, exercise bikes, and gym equipment. Expert handling of heavy machinery.",
    category: "Sports Equipment",
    icon: "🏃",
    relatedServices: ["furniture-delivery", "man-and-van", "house-removals"],
  },
  "garden-furniture": {
    slug: "garden-furniture",
    title: "Garden Furniture & Outdoor Items",
    description:
      "Removal of garden furniture, patio sets, and outdoor equipment. Weather-resistant packing and safe transport.",
    category: "Outdoor",
    icon: "🪴",
    relatedServices: ["furniture-delivery", "man-and-van", "house-removals"],
  },
  "moving-boxes": {
    slug: "moving-boxes",
    title: "Moving Boxes & Packing Supplies",
    description:
      "High-quality moving boxes, packing materials, and supplies. Eco-friendly options available for sustainable moving.",
    category: "Packing Supplies",
    icon: "📦",
    relatedServices: ["man-and-van", "furniture-delivery"],
  },
};

export const PILLAR_SLUGS = Object.keys(PILLAR_ITEMS) as Array<
  keyof typeof PILLAR_ITEMS
>;

export function isPillarItem(slug: string): boolean {
  return PILLAR_SLUGS.includes(slug as keyof typeof PILLAR_ITEMS);
}

export function getPillarItemMeta(
  slug: string
): PillarItemMeta | undefined {
  return PILLAR_ITEMS[slug as keyof typeof PILLAR_ITEMS];
}
