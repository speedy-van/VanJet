// ─── VanJet · Chakra UI v3 Design System ──────────────────────
// Brand Blue #1D4ED8 · Amber CTA #F59E0B · Success Green #059669
// Background #F8FAFC · Border #E2E8F0 · Card Shadow 0 1px 3px
// Warm neutrals · Inter · 8px spacing base · 12px card radius
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const vanjetConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        // ── Primary — Brand Blue ─────────────────────────────
        brand: {
          50:  { value: "#EFF6FF" },
          100: { value: "#DBEAFE" },
          200: { value: "#BFDBFE" },
          300: { value: "#93C5FD" },
          400: { value: "#60A5FA" },
          500: { value: "#3B82F6" },
          600: { value: "#2563EB" },
          700: { value: "#1D4ED8" },  // PRIMARY
          800: { value: "#1E40AF" },
          900: { value: "#1E3A8A" },
        },
        // ── CTA — Amber ──────────────────────────────────────
        accent: {
          50:  { value: "#FFF7ED" },
          100: { value: "#FFEDD5" },
          200: { value: "#FED7AA" },
          300: { value: "#FDBA74" },
          400: { value: "#FBBF24" },
          500: { value: "#F59E0B" },  // CTA COLOUR
          600: { value: "#D97706" },
          700: { value: "#B45309" },
          800: { value: "#92400E" },
          900: { value: "#78350F" },
        },
        // ── Success — Emerald ────────────────────────────────
        success: {
          50:  { value: "#ECFDF5" },
          100: { value: "#D1FAE5" },
          200: { value: "#A7F3D0" },
          300: { value: "#6EE7B7" },
          400: { value: "#34D399" },
          500: { value: "#10B981" },
          600: { value: "#059669" },
          700: { value: "#047857" },
          800: { value: "#065F46" },
          900: { value: "#064E3B" },
        },
        // ── Danger ───────────────────────────────────────────
        danger: {
          500: { value: "#DC2626" },
          600: { value: "#B91C1C" },
        },
        // ── Neutrals ─────────────────────────────────────────
        neutral: {
          50:  { value: "#F9FAFB" },
          100: { value: "#F3F4F6" },
          200: { value: "#E5E7EB" },
          300: { value: "#D1D5DB" },
          400: { value: "#9CA3AF" },
          500: { value: "#6B7280" },
          600: { value: "#4B5563" },
          700: { value: "#374151" },
          800: { value: "#1F2937" },
          900: { value: "#111827" },
        },
        // ── UI Tokens ────────────────────────────────────────
        bg: {
          page:   { value: "#F8FAFC" },  // Soft background
          card:   { value: "#FFFFFF" },  // Card background
        },
        border: {
          card:   { value: "#E2E8F0" },  // Card borders
          input:  { value: "#E5E7EB" },  // Input borders
        },
      },
      fonts: {
        heading: { value: "Inter, -apple-system, sans-serif" },
        body:    { value: "Inter, -apple-system, sans-serif" },
      },
      radii: {
        card:   { value: "12px" },
        button: { value: "8px" },
        input:  { value: "8px" },
        badge:  { value: "9999px" },
      },
      shadows: {
        card:   { value: "0 1px 3px rgba(0, 0, 0, 0.08)" },
        hover:  { value: "0 4px 12px rgba(0, 0, 0, 0.12)" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, vanjetConfig);
