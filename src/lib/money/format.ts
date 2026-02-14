// ─── VanJet · GBP Currency Formatting (Single Source of Truth) ──────
const gbpFull = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const gbpWhole = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Format a number as GBP with 2 decimal places.
 * e.g. formatGBP(1234.5) → "£1,234.50"
 * Handles NaN / null / undefined → "£0.00"
 */
export function formatGBP(amount: number | null | undefined): string {
  const safe = typeof amount === "number" && !Number.isNaN(amount) ? amount : 0;
  return gbpFull.format(safe);
}

/**
 * Format a number as GBP with no decimals (whole pounds).
 * e.g. formatGBPWhole(1234.5) → "£1,235"
 */
export function formatGBPWhole(amount: number | null | undefined): string {
  const safe = typeof amount === "number" && !Number.isNaN(amount) ? amount : 0;
  return gbpWhole.format(safe);
}

/**
 * Compact GBP for large values.
 * e.g. formatGBPCompact(1200) → "£1.2k"
 */
export function formatGBPCompact(amount: number | null | undefined): string {
  const safe = typeof amount === "number" && !Number.isNaN(amount) ? amount : 0;
  if (safe >= 1_000_000) return `£${(safe / 1_000_000).toFixed(1)}m`;
  if (safe >= 1_000) return `£${(safe / 1_000).toFixed(1)}k`;
  return gbpFull.format(safe);
}
