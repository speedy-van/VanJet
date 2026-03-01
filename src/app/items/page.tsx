// ─── VanJet · Items Directory ─────────────────────────────────
// Searchable, filterable index of all furniture & removal items.
// Shows categorized items from our dataset with links to pillar pages
// and helpful "Related Pillar Item" suggestions for non-pillar items.

import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/seo/site";
import { PILLAR_ITEMS } from "@/lib/seo/pillar-items";

export const metadata: Metadata = {
  title: "All Items We Move — VanJet",
  description:
    "Browse our complete list of furniture and items we move. Find guides for sofas, beds, wardrobes, appliances, pianos, and more.",
  alternates: { canonical: "/items" },
  openGraph: {
    title: "All Items We Move — VanJet",
    description:
      "Complete directory of furniture and items we move with expert handling guides.",
    url: `${SITE.baseUrl}/items`,
    siteName: SITE.name,
    type: "website",
  },
};

// ─── Dataset Categories & Items ───────────────────────────────
// All items available for removal categorized by type.
// Items with ⭐ are pillar items with dedicated pages & deep content.

const ITEM_CATEGORIES: Record<string, string[]> = {
  "Living Room Furniture": [
    "sofa",
    "corner-sofa",
    "armchair",
    "coffee-table",
    "tv-unit",
    "bookshelf",
    "side-table",
  ],
  "Bedroom Furniture": [
    "bed-frame",
    "mattress",
    "wardrobe",
    "chest-of-drawers",
    "dressing-table",
    "nightstand",
    "bed-frame-headboard",
  ],
  "Dining Furniture": ["dining-table", "dining-chairs", "sideboard", "bar-stool"],
  "Office Furniture": [
    "desk",
    "office-chair",
    "filing-cabinet",
    "bookcase",
    "shelving-unit",
    "desk-lamp",
  ],
  "Kitchen Appliances": [
    "fridge-freezer",
    "washing-machine",
    "dishwasher",
    "cooker-oven",
    "microwave",
    "kettle",
    "toaster",
  ],
  "Storage & Organization": [
    "chest-of-drawers",
    "wardrobe",
    "bookcase",
    "shelving-unit",
    "storage-boxes",
    "moving-boxes",
    "filing-cabinet",
  ],
  "Specialist Items": ["piano", "safe", "artwork", "antique-furniture", "safe"],
  "Decorative Items": ["mirror", "artwork", "wall-hangings", "plant-stand"],
  "Sports & Leisure": [
    "treadmill",
    "exercise-bike",
    "gym-equipment",
    "table-tennis-table",
  ],
  "Outdoor & Garden": [
    "garden-furniture",
    "garden-shed",
    "patio-set",
    "outdoor-heater",
  ],
  "Television & Media": ["tv", "sound-system", "media-console"],
  "Fragile & Delicate": [
    "mirror",
    "artwork",
    "glassware",
    "ceramics",
    "crystal",
  ],
};

// ─── Pillar Item Map ──────────────────────────────────────────
// Map non-pillar items to their closest pillar suggestion.

const PILLAR_SUGGESTIONS: Record<string, string> = {
  "coffee-table": "dining-table",
  "tv-unit": "tv",
  "side-table": "dining-table",
  "dining-chairs": "dining-table",
  "dressing-table": "chest-of-drawers",
  "nightstand": "bed-frame",
  "bed-frame-headboard": "bed-frame",
  sideboard: "dining-table",
  "bar-stool": "dining-table",
  "office-chair": "desk",
  "filing-cabinet": "desk",
  "shelving-unit": "bookcase",
  "desk-lamp": "desk",
  microwave: "cooker-oven",
  kettle: "cooker-oven",
  toaster: "cooker-oven",
  "storage-boxes": "moving-boxes",
  "antique-furniture": "artwork",
  "wall-hangings": "artwork",
  "plant-stand": "garden-furniture",
  "exercise-bike": "treadmill",
  "gym-equipment": "treadmill",
  "table-tennis-table": "treadmill",
  "garden-shed": "garden-furniture",
  "patio-set": "garden-furniture",
  "outdoor-heater": "garden-furniture",
  "sound-system": "tv",
  "media-console": "tv",
  glassware: "mirror",
  ceramics: "artwork",
  crystal: "mirror",
};

function getPillarSuggestion(itemSlug: string): string | null {
  if (itemSlug in PILLAR_ITEMS) return null; // It's already a pillar item
  return PILLAR_SUGGESTIONS[itemSlug] || null;
}

function formatItemName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function isPillar(slug: string): boolean {
  return slug in PILLAR_ITEMS;
}

export default function ItemsPage() {
  const pillarSlugs = Object.keys(PILLAR_ITEMS);

  return (
    <main style={{ fontFamily: "var(--font-inter), sans-serif" }}>
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #1D4ED8 100%)",
          color: "white",
          padding: "48px 16px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              marginBottom: 16,
              lineHeight: 1.2,
            }}
          >
            All Items We Move
          </h1>
          <p style={{ fontSize: "1.125rem", opacity: 0.9, maxWidth: 600 }}>
            Browse our complete directory. Items with ⭐ have detailed guides. Others link
            to the closest related pillar item.
          </p>
        </div>
      </div>

      {/* Categories */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 16px" }}>
        <div style={{ display: "grid", gap: 48 }}>
          {Object.entries(ITEM_CATEGORIES).map(([category, items]) => (
            <section key={category}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#0F172A",
                  marginBottom: 24,
                }}
              >
                {category}
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 16,
                }}
              >
                {items.map((itemSlug) => {
                  const isPillarItem = isPillar(itemSlug);
                  const suggestion = !isPillarItem
                    ? getPillarSuggestion(itemSlug)
                    : null;
                  const itemName = formatItemName(itemSlug);
                  const pillarName = suggestion
                    ? formatItemName(suggestion)
                    : null;

                  return (
                    <div
                      key={itemSlug}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        border: isPillarItem
                          ? "2px solid #1D4ED8"
                          : "1px solid #E5E7EB",
                        background: isPillarItem ? "#EFF6FF" : "white",
                        transition: "all 0.3s",
                      }}
                    >
                      {isPillarItem ? (
                        <Link
                          href={`/items/${itemSlug}`}
                          style={{ textDecoration: "none" }}
                        >
                          <div style={{ cursor: "pointer" }}>
                            <h3
                              style={{
                                fontSize: "1rem",
                                fontWeight: 700,
                                color: "#1D4ED8",
                                marginBottom: 8,
                              }}
                            >
                              ⭐ {itemName}
                            </h3>
                            <p
                              style={{
                                fontSize: "0.875rem",
                                color: "#6B7280",
                                lineHeight: 1.5,
                              }}
                            >
                              View detailed guide with expert tips, FAQs, and pricing.
                            </p>
                          </div>
                        </Link>
                      ) : (
                        <div>
                          <h3
                            style={{
                              fontSize: "1rem",
                              fontWeight: 700,
                              color: "#374151",
                              marginBottom: 8,
                            }}
                          >
                            {itemName}
                          </h3>
                          {suggestion ? (
                            <p
                              style={{
                                fontSize: "0.875rem",
                                color: "#6B7280",
                                lineHeight: 1.5,
                                marginBottom: 8,
                              }}
                            >
                              Related to{" "}
                              <Link
                                href={`/items/${suggestion}`}
                                style={{ color: "#1D4ED8", fontWeight: 600 }}
                              >
                                {pillarName} →
                              </Link>
                            </p>
                          ) : (
                            <p
                              style={{
                                fontSize: "0.875rem",
                                color: "#6B7280",
                                lineHeight: 1.5,
                              }}
                            >
                              Contact us for a custom quote.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: 64,
            padding: 48,
            borderRadius: 16,
            background:
              "linear-gradient(135deg, #F3F4F6 0%, #FFFFFF 100%)",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#0F172A",
              marginBottom: 16,
            }}
          >
            Can't Find What You're Looking For?
          </h2>
          <p style={{ fontSize: "1rem", color: "#6B7280", marginBottom: 24 }}>
            Our team handles specialist items and custom removals. Get an instant quote.
          </p>
          <Link href="/book">
            <button
              style={{
                padding: "12px 32px",
                fontSize: "1rem",
                fontWeight: 700,
                color: "#111827",
                background: "#F59E0B",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Get Instant Quote →
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
