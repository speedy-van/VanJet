// ─── VanJet · Pricing History / Learning Hooks ────────────────
// Safe stubs that return neutral multipliers until historical data exists.
// DB-ready: when quote_outcomes table is added, swap in real queries.
// English only.

/**
 * Get a pricing adjustment based on historical acceptance rates for a job type.
 * Returns a multiplier (1.0 = no adjustment).
 *
 * Future: If acceptance rate is low for a job type in an area,
 * lower the multiplier (cheaper) to attract more bookings.
 * If acceptance is high, raise it slightly.
 */
export function getAcceptanceAdjustment(
  _jobType: string,
  _areaHint?: string
): number {
  // Stub: neutral until we have historical data
  return 1.0;
}

/**
 * Get a seasonal correction multiplier for the given month.
 * Returns a multiplier (1.0 = no adjustment).
 *
 * Future: trained on actual completion data by month.
 * For now, returns 1.0 — the demand multiplier in rates.ts already
 * handles seasonal patterns via static config.
 */
export function getSeasonalCorrection(_month: number): number {
  // Stub: neutral
  return 1.0;
}

/**
 * Record the outcome of a quoted job for future learning.
 * No-op for now; will persist to a `quote_outcomes` table when created.
 */
export function recordQuoteOutcome(_outcome: {
  jobId: string;
  quotedPrice: number;
  accepted: boolean;
  completed: boolean;
}): void {
  // No-op stub — ready for implementation when DB table exists
}
