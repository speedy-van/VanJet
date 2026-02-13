import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure server-only packages are not bundled for the client
  serverExternalPackages: ["@neondatabase/serverless", "stripe", "resend"],

  // ── Image optimisation ────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },

  // ── Compression ───────────────────────────────────────────────
  compress: true,

  // ── Security & caching headers ────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // HSTS (safe for production; local dev ignores over HTTP)
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // Cache static assets aggressively
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // ── Redirects ─────────────────────────────────────────────────
  async redirects() {
    return [
      // Legacy URL patterns
      {
        source: "/man-and-van",
        destination: "/man-and-van/london",
        permanent: true,
      },
      {
        source: "/house-removals",
        destination: "/house-removals/london",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
