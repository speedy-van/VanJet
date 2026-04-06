// ─── VanJet · Sitemap ─────────────────────────────────────────
// Programmatic sitemap. English only. No car/motorcycle.
// Scottish cities prioritised. Only 22 pillar item pages included.
import type { MetadataRoute } from "next";
import { SITE, VALID_SERVICES, CITY_DATA, isScottishCity } from "@/lib/seo/site";
import { PILLAR_SLUGS } from "@/lib/seo/pillar-items";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.baseUrl;
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  // ── Static pages ────────────────────────────────────────────
  const staticPages = [
    { url: "/", priority: 1.0, changeFrequency: "daily" as const },
    { url: "/book", priority: 0.9, changeFrequency: "weekly" as const },
    { url: "/items", priority: 0.8, changeFrequency: "weekly" as const },
    { url: "/safety-and-insurance", priority: 0.7, changeFrequency: "monthly" as const },
    { url: "/blog", priority: 0.7, changeFrequency: "weekly" as const },
    { url: "/reviews", priority: 0.7, changeFrequency: "weekly" as const },
    { url: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/privacy", priority: 0.5, changeFrequency: "monthly" as const },
    { url: "/login", priority: 0.5, changeFrequency: "monthly" as const },
    { url: "/register", priority: 0.5, changeFrequency: "monthly" as const },
  ];

  for (const page of staticPages) {
    entries.push({
      url: `${base}${page.url}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
  }

  // ── /[service]/[city] (programmatic SEO landing pages) ──────
  // Scottish cities get higher priority (0.9) than English cities (0.7)
  for (const service of VALID_SERVICES) {
    for (const city of Object.keys(CITY_DATA)) {
      const isScottish = isScottishCity(city);
      entries.push({
        url: `${base}/${service}/${city}`,
        lastModified: now,
        changeFrequency: isScottish ? "weekly" : "monthly",
        priority: isScottish ? 0.9 : 0.7,
      });
    }
  }

  // ── /items/[item] (PILLAR ITEMS ONLY: 22 high-quality pages) ─
  // Non-pillar items are found in /items directory (searchable, no individual pages)
  for (const item of PILLAR_SLUGS) {
    entries.push({
      url: `${base}/items/${item}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  // ── Blog posts (4 seed + 8 new = 12 total) ──────────────────
  const blogSlugs = [
    "how-to-save-money-on-house-removals",
    "complete-guide-man-and-van-uk",
    "packing-tips-for-stress-free-move",
    "office-relocation-checklist",
    "how-to-move-a-sofa-safely",
    "how-to-move-a-wardrobe-safely",
    "how-to-move-a-bed-and-mattress-safely",
    "how-to-move-a-fridge-freezer-safely",
    "how-to-move-a-washing-machine-safely",
    "how-to-move-a-piano-safely",
    "how-to-move-a-safe-safely",
    "how-to-pack-moving-boxes-like-a-pro",
  ];
  for (const slug of blogSlugs) {
    entries.push({
      url: `${base}/blog/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
