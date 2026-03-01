// ─── VanJet · Items Taxonomy for SEO ──────────────────────────
// Furniture and common removal items with SEO metadata.
// Used for generating item-intent landing pages.

export interface ItemMeta {
  slug: string;
  title: string;
  description: string;
  category: string;
  serviceTypes: string[];
  faqs: { question: string; answer: string }[];
}

export const ITEMS_TAXONOMY: Record<string, ItemMeta> = {
  sofa: {
    slug: "sofa",
    title: "Sofa Removal & Delivery",
    description:
      "Professional sofa removal and delivery service. Safe transport for sectionals, recliners, and modern sofas across the UK.",
    category: "Furniture",
    serviceTypes: ["Furniture Delivery", "House Removals", "Man and Van"],
    faqs: [
      {
        question: "What is the average cost to move a sofa in the UK?",
        answer:
          "Sofa removal typically costs £100-£400 depending on size, distance, and location. Use VanJet to get instant quotes from verified drivers near you.",
      },
      {
        question: "Can you move a large sectional sofa through a narrow door?",
        answer:
          "Most sectional sofas can be disassembled into sections for easier movement through doorways. Our drivers can advise on the best approach for your space.",
      },
      {
        question: "Is my sofa insured during removal?",
        answer:
          "Yes. All VanJet bookings include up to £50,000 of public liability insurance. Damage claims are covered subject to the terms of your policy.",
      },
      {
        question: "How far in advance should I book a sofa removal?",
        answer:
          "You can book on the same day via VanJet. For standard moves, 1-2 weeks advance notice gives more driver availability and better pricing.",
      },
    ],
  },
  bed: {
    slug: "bed",
    title: "Bed & Mattress Removal & Delivery",
    description:
      "Fast, affordable bed and mattress delivery across the UK. Single, double, queen, and king size beds moved safely by verified drivers.",
    category: "Furniture",
    serviceTypes: ["Furniture Delivery", "House Removals", "Man and Van"],
    faqs: [
      {
        question: "How much does it cost to move a bed frame in the UK?",
        answer:
          "Moving a bed frame typically costs £80-£250 depending on mattress inclusion, distance, and location. Get instant quotes on VanJet.",
      },
      {
        question: "Can you move a mattress safely wrapped?",
        answer:
          "Yes. Professional mattress wrapping protects against dirt, moisture, and damage. All VanJet drivers wrap mattresses as standard.",
      },
      {
        question: "Does the driver assemble the bed at the new location?",
        answer:
          "Most drivers can help with basic assembly. Confirm with your chosen driver before booking for specific assembly support.",
      },
      {
        question: "What types of beds can be moved by van?",
        answer:
          "All types: divan bases, frames, adjustable beds, platform beds, and bunk beds. Complex items like Murphy beds may require specialist handling.",
      },
    ],
  },
  wardrobe: {
    slug: "wardrobe",
    title: "Wardrobe & Wardrobe Removal Service",
    description:
      "Safe wardrobe and large closet removal. Expert handling for fitted wardrobes, built-in cabinets, and standalone units across the UK.",
    category: "Furniture",
    serviceTypes: ["Furniture Delivery", "House Removals", "Office Removals"],
    faqs: [
      {
        question: "How much does it cost to move a wardrobe?",
        answer:
          "Wardrobe removal costs £150-£600 depending on type (fitted or freestanding), size, and distance. VanJet provides instant quotes.",
      },
      {
        question: "Can you disassemble and reassemble my wardrobe?",
        answer:
          "Yes. Most freestanding wardrobes can be disassembled, transported, and reassembled. Fitted wardrobes require specialist handling.",
      },
      {
        question: "Will the wardrobe be protected during transport?",
        answer:
          "Absolutely. Our drivers use moving blankets, straps, and protective covers to prevent scratches, dents, and damage to finish.",
      },
      {
        question: "Do I need to empty the wardrobe before moving?",
        answer:
          "Yes. Empty all drawers and shelves entirely for safety and to reduce weight. This also prevents items from shifting during transport.",
      },
    ],
  },
  table: {
    slug: "table",
    title: "Dining Table & Desk Removal Service",
    description:
      "Professional removal of dining tables, desks, and work surfaces. Handles large, glass, and specialty tables safely across the UK.",
    category: "Furniture",
    serviceTypes: ["Furniture Delivery", "House Removals", "Office Removals"],
    faqs: [
      {
        question: "How much does table removal cost in the UK?",
        answer:
          "Table removal costs £60-£250 depending on size, material, and distance. Glass tables and marble-top tables may cost more. Get quotes on VanJet.",
      },
      {
        question: "Can you move a large glass or marble table safely?",
        answer:
          "Yes. Specialist handling and protective wrapping protects delicate surfaces. Glass and marble tables are secured with additional straps.",
      },
      {
        question: "Do you disassemble tables with removable legs?",
        answer:
          "Yes. Standard table legs are removed to reduce size and prevent damage. Reassembly at the new location is included.",
      },
      {
        question: "What about antique or expensive tables?",
        answer:
          "Antique and high-value tables require specialist handling. Request specialist movers when booking and provide photos for accurate quotes.",
      },
    ],
  },
  piano: {
    slug: "piano",
    title: "Piano Removal & Transportation Service",
    description:
      "Expert piano removal and safe transportation across the UK. Acoustic, digital, and grand pianos handled by certified specialists.",
    category: "Specialist Items",
    serviceTypes: ["Specialist Items", "House Removals"],
    faqs: [
      {
        question: "How much does it cost to move a piano in the UK?",
        answer:
          "Piano removal costs £400-£2,000+ depending on type (upright vs grand), distance, and location. Request specialist quotes on VanJet.",
      },
      {
        question: "Will my piano be damaged during removal?",
        answer:
          "Professional piano movers use specialized equipment and techniques to prevent damage. All pianos are insured during transit.",
      },
      {
        question: "Does the piano need tuning after moving?",
        answer:
          "Yes. Moving can slightly affect piano tuning. Professional tuning 2-3 weeks after moving is recommended for best results.",
      },
      {
        question: "Can you move a grand piano up stairs?",
        answer:
          "Grand pianos can be moved upstairs with proper equipment and expertise. Some narrow spaces may require temporary furniture removal.",
      },
    ],
  },
  fridge: {
    slug: "fridge",
    title: "Fridge & Freezer Removal & Delivery",
    description:
      "Safe refrigerator and freezer removal and delivery. Expert handling for all sizes, including delivery setup and installation help.",
    category: "Appliances",
    serviceTypes: ["Furniture Delivery", "House Removals", "Man and Van"],
    faqs: [
      {
        question: "How much does it cost to move a fridge?",
        answer:
          "Fridge removal costs £80-£300 depending on size and distance. Most simple deliveries are under £150. Get instant quotes on VanJet.",
      },
      {
        question: "How long after moving should I wait before plugging in the fridge?",
        answer:
          "Wait 4-24 hours depending on how much the fridge was tilted during transport. Horizontal transport requires the longest wait time.",
      },
      {
        question: "Do you provide delivery into the kitchen?",
        answer:
          "Yes. Most drivers will carry the fridge to your kitchen. Plumbing connection is not typically included — ask your driver first.",
      },
      {
        question: "Is my fridge insured during removal?",
        answer:
          "Yes. All VanJet bookings include £50,000 public liability insurance covering damage claims.",
      },
    ],
  },
  "washing-machine": {
    slug: "washing-machine",
    title: "Washing Machine Removal & Installation",
    description:
      "Washing machine and appliance removal and delivery across the UK. Includes disconnection, transport, and installation services.",
    category: "Appliances",
    serviceTypes: ["Furniture Delivery", "House Removals", "Man and Van"],
    faqs: [
      {
        question: "How much does it cost to move a washing machine?",
        answer:
          "Washing machine removal costs £80-£250 depending on type and distance. VanJet provides instant quotes from local drivers.",
      },
      {
        question: "Do you disconnect and reconnect the washing machine?",
        answer:
          "Most drivers can disconnect at the old location but cannot reconnect at the new one (plumbing/electrical). You'll need a qualified engineer.",
      },
      {
        question: "How should I prepare my washing machine for moving?",
        answer:
          "Drain all water, secure the drum with transit bolts (usually included), disconnect inlet/outlet hoses, and tape the door closed.",
      },
      {
        question: "Is my washing machine covered by insurance?",
        answer:
          "Yes. All appliances are covered by our £50,000 liability insurance. Damage claims are straightforward to file.",
      },
    ],
  },
  desk: {
    slug: "desk",
    title: "Office Desk & Workstation Removal",
    description:
      "Professional office desk and workstation removal for home offices and businesses. Expert desk disassembly and reassembly included.",
    category: "Office Furniture",
    serviceTypes: ["Office Removals", "Furniture Delivery", "Man and Van"],
    faqs: [
      {
        question: "How much does office desk removal cost?",
        answer:
          "Desk removal costs £80-£250 each depending on size and complexity. Bulk office moves receive discounts. Get quotes on VanJet.",
      },
      {
        question: "Can you disassemble and reassemble my desk?",
        answer:
          "Yes. Most desks are disassembled for transport and reassembled at your new location at no extra charge.",
      },
      {
        question: "What about cable management and equipment?",
        answer:
          "Photograph your cable setup before moving. Drivers can help disconnect but reconnection at the new location is your responsibility.",
      },
      {
        question: "Do you handle standing desks and electric systems?",
        answer:
          "Yes. Electric standing desks are carefully disconnected and the motors are protected. Test functionality after setup at the new location.",
      },
    ],
  },
  boxes: {
    slug: "boxes",
    title: "Moving Boxes & Packing Materials Delivery",
    description:
      "Affordable moving boxes, packing materials, and supplies delivered to your door. Sourced from sustainable suppliers across the UK.",
    category: "Packing Supplies",
    serviceTypes: ["Man and Van"],
    faqs: [
      {
        question: "How many boxes do I need for a house move?",
        answer:
          "Average house needs 50-100 boxes. A 1-bed flat: 30-50 boxes. A 4-bed house: 100-150 boxes. Calculate based on your items.",
      },
      {
        question: "Where can I get free moving boxes?",
        answer:
          "Supermarkets often give away boxes. Ask friends/family. We also offer affordable boxes on VanJet with your removal booking.",
      },
      {
        question: "What size boxes are best for packing?",
        answer:
          "Small (12x12x12) for heavy items, medium (18x18x16) for mixed items, large (24x18x18) for light items like duvets. Mix sizes for efficiency.",
      },
      {
        question: "Can I recycle or return packing boxes after moving?",
        answer:
          "Yes. Many areas have recycling programs. Some removal companies buy back boxes. Ask your driver or local council.",
      },
    ],
  },
  mattress: {
    slug: "mattress",
    title: "Mattress Removal & Delivery Service",
    description:
      "Safe and affordable mattress removal and delivery. All mattress types: memory foam, spring, hybrid, and orthopaedic beds moved across the UK.",
    category: "Furniture",
    serviceTypes: ["Furniture Delivery", "House Removals", "Man and Van"],
    faqs: [
      {
        question: "How much does mattress removal cost?",
        answer:
          "Mattress delivery costs £40-£150 depending on size and distance. Twin mattresses are cheaper than king-size. Get instant quotes on VanJet.",
      },
      {
        question: "Is the mattress wrapped or protected?",
        answer:
          "Yes. All mattresses are wrapped in plastic or moving blankets to prevent stains, dust, and damage during transport.",
      },
      {
        question: "Can you dispose of my old mattress?",
        answer:
          "Yes. Many drivers can dispose of old mattresses for an extra fee (usually £20-50). Confirm with your driver before booking.",
      },
      {
        question: "Can I use a mattress immediately after moving?",
        answer:
          "Yes. Mattresses can be used immediately. Remove the protective wrap and let it air for 24 hours if there's a plastic smell.",
      },
    ],
  },
};

export const ITEMS_LIST = Object.values(ITEMS_TAXONOMY).map((item) => item.slug);

export function getItemMeta(slug: string): ItemMeta | undefined {
  return ITEMS_TAXONOMY[slug];
}
