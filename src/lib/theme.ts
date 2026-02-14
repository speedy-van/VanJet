// ─── VanJet · Chakra UI v3 Design System ──────────────────────
// Trust Blue #1D4ED8 · Warm Amber #F59E0B · Success Green #059669
// Warm neutrals · Inter · 8px spacing base · 12px card radius
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const vanjetConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        // ── Primary — Navy ───────────────────────────────────
        navy: {
          50:  { value: "#E8EEF7" },
          100: { value: "#C5D6EB" },
          200: { value: "#9EBDDD" },
          300: { value: "#76A4CF" },
          400: { value: "#5891C4" },
          500: { value: "#0F2D5E" },
          600: { value: "#0D2755" },
          700: { value: "#0A214C" },
          800: { value: "#071B42" },
          900: { value: "#041130" },
        },
        // ── Secondary — Blue ─────────────────────────────────
        brand: {
          50:  { value: "#EFF6FF" },
          100: { value: "#DBEAFE" },
          200: { value: "#BFDBFE" },
          300: { value: "#93C5FD" },
          400: { value: "#60A5FA" },
          500: { value: "#1E40AF" },
          600: { value: "#1E3A8A" },
          700: { value: "#1E3A8A" },
          800: { value: "#1E3A8A" },
          900: { value: "#1E3A8A" },
        },
        // ── CTA — Amber ──────────────────────────────────────
        amber: {
          50:  { value: "#FFF7ED" },
          100: { value: "#FFEDD5" },
          200: { value: "#FED7AA" },
          300: { value: "#FDBA74" },
          400: { value: "#FB923C" },
          500: { value: "#F97316" },
          600: { value: "#EA580C" },
          700: { value: "#C2410C" },
          800: { value: "#9A3412" },
          900: { value: "#7C2D12" },
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
        // ── Text & Neutrals ──────────────────────────────────
        neutral: {
          50:  { value: "#F8FAFC" },  // page bg
          100: { value: "#F1F5F9" },  // alt section bg
          200: { value: "#E2E8F0" },  // borders
          300: { value: "#CBD5E1" },
          400: { value: "#94A3B8" },  // muted text
          500: { value: "#64748B" },  // secondary text
          600: { value: "#475569" },
          700: { value: "#334155" },  // body text
          800: { value: "#1E293B" },
          900: { value: "#0F172A" },  // title text
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
