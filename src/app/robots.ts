// ─── VanJet · robots.txt ──────────────────────────────────────
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/driver/",
          "/checkout/",
          "/_next/",
          "/*?*",
        ],
      },
    ],
    sitemap: `${SITE.baseUrl}/sitemap.xml`,
  };
}
