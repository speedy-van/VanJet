// ─── VanJet · Open Graph Image (Edge) ──────────────────────────
// Next.js convention file — auto-serves /opengraph-image at build time
// 1200 × 630 card with dark gradient + brand mark + tagline

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "VanJet — UK Removal & Delivery Marketplace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* Mark — V chevron */}
        <svg
          width="120"
          height="100"
          viewBox="0 0 140 120"
          style={{ marginBottom: 24 }}
        >
          <defs>
            <linearGradient
              id="og-v"
              x1="45"
              y1="22"
              x2="111"
              y2="100"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="50%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="og-t" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="1" />
            </linearGradient>
          </defs>
          <rect x="2" y="33" width="28" height="5" rx="2.5" fill="url(#og-t)" />
          <rect x="0" y="55" width="40" height="5" rx="2.5" fill="url(#og-t)" />
          <rect x="2" y="77" width="28" height="5" rx="2.5" fill="url(#og-t)" />
          <path
            d="M45 22 L78 100 L111 22"
            stroke="url(#og-v)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>

        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: -2,
            marginBottom: 16,
          }}
        >
          <span style={{ color: "#f1f5f9" }}>Van</span>
          <span style={{ color: "#22d3ee" }}>Jet</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#94a3b8",
            fontWeight: 500,
          }}
        >
          Fast, reliable delivery across the UK
        </div>
      </div>
    ),
    { ...size }
  );
}
