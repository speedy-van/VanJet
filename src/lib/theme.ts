// ─── VanJet · Chakra UI v3 Design System ──────────────────────
// Trust Blue #1D4ED8 · Warm Amber #F59E0B · Success Green #059669
// Warm neutrals · Inter · 8px spacing base · 12px card radius
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const vanjetConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        // ── Primary — Trust Blue ─────────────────────────────
        brand: {
          50:  { value: "#EBF1FF" },
          100: { value: "#D4E2FF" },
          200: { value: "#A8C4FF" },
          300: { value: "#7CA6FF" },
          400: { value: "#4F7DE8" },
          500: { value: "#1D4ED8" },
          600: { value: "#1840B8" },
          700: { value: "#133498" },
          800: { value: "#0E2878" },
          900: { value: "#091C58" },
        },
        // ── Secondary — Warm Amber (CTAs) ────────────────────
        amber: {
          50:  { value: "#FFFBEB" },
          100: { value: "#FEF3C7" },
          200: { value: "#FDE68A" },
          300: { value: "#FCD34D" },
          400: { value: "#FBBF24" },
          500: { value: "#F59E0B" },
          600: { value: "#D97706" },
          700: { value: "#B45309" },
          800: { value: "#92400E" },
          900: { value: "#78350F" },
        },
        // ── Accent — Success Green ───────────────────────────
        success: {
          50:  { value: "#ECFDF5" },
          100: { value: "#D1FAE5" },
          200: { value: "#A7F3D0" },
          300: { value: "#6EE7B7" },
          400: { value: "#34D399" },
          500: { value: "#059669" },
          600: { value: "#047857" },
          700: { value: "#065F46" },
          800: { value: "#064E3B" },
          900: { value: "#053D31" },
        },
        // ── Danger ───────────────────────────────────────────
        danger: {
          500: { value: "#DC2626" },
          600: { value: "#B91C1C" },
        },
        // ── Warning ──────────────────────────────────────────
        warning: {
          500: { value: "#D97706" },
          600: { value: "#B45309" },
        },
        // ── Warm Neutral Scale ───────────────────────────────
        neutral: {
          50:  { value: "#F9FAFB" },  // page background
          100: { value: "#F3F4F6" },
          200: { value: "#E5E7EB" },  // borders & dividers
          300: { value: "#D1D5DB" },
          400: { value: "#9CA3AF" },
          500: { value: "#6B7280" },  // secondary text
          600: { value: "#4B5563" },
          700: { value: "#374151" },
          800: { value: "#1F2937" },
          900: { value: "#111827" },  // body text
        },
      },
      fonts: {
        heading: { value: "'Inter', sans-serif" },
        body:    { value: "'Inter', sans-serif" },
      },
      radii: {
        card:   { value: "12px" },
        button: { value: "8px" },
        input:  { value: "8px" },
        badge:  { value: "999px" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, vanjetConfig);
