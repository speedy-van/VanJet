// ─── VanJet · Sitemap ─────────────────────────────────────────
// Programmatic sitemap. English only. No car/motorcycle.
import type { MetadataRoute } from "next";
import { SITE, VALID_SERVICES, CITY_DATA } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.baseUrl;
  const now = new Date().toISOString();

  const entries: MetadataRoute.Sitemap = [];

  // ── Static pages ────────────────────────────────────────────
  const staticPages = [
    { url: "/", priority: 1.0, changeFrequency: "daily" as const },
    { url: "/book", priority: 0.9, changeFrequency: "weekly" as const },
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
  for (const service of VALID_SERVICES) {
    for (const city of Object.keys(CITY_DATA)) {
      entries.push({
        url: `${base}/${service}/${city}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  // ── Blog seed posts ─────────────────────────────────────────
  const blogSlugs = [
    "how-to-save-money-on-house-removals",
    "complete-guide-man-and-van-uk",
    "packing-tips-for-stress-free-move",
    "office-relocation-checklist",
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
