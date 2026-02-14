// ─── VanJet · Distance Utilities (Single Source of Truth) ──────
// UK standard: miles. Mapbox returns metres internally.

const METERS_PER_MILE = 1609.344;
const KM_PER_MILE = 1.60934;

/** Convert metres (from Mapbox) to miles. */
export function metersToMiles(meters: number): number {
  return Math.round((meters / METERS_PER_MILE) * 100) / 100;
}

/** Convert kilometres to miles. */
export function kmToMiles(km: number): number {
  return Math.round((km / KM_PER_MILE) * 100) / 100;
}

/** Convert miles to kilometres (internal use only). */
export function milesToKm(miles: number): number {
  return Math.round(miles * KM_PER_MILE * 100) / 100;
}

/**
 * Format miles for display.
 * e.g. formatMiles(12.4) → "12.4 mi"
 */
export function formatMiles(miles: number | null | undefined): string {
  const safe = typeof miles === "number" && !Number.isNaN(miles) ? miles : 0;
  return `${safe.toFixed(1)} mi`;
}
