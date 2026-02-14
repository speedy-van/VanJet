// ─── VanJet · Reference Number Generator ──────────────────────
/**
 * Generate a human-friendly reference number like "VJ-1234"
 * @param prefix - The prefix (default: "VJ")
 * @returns Reference number string (e.g., "VJ-1234")
 */
export function generateReferenceNumber(prefix = "VJ"): string {
  // Generate 4 random digits (0000-9999)
  const randomDigits = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  
  return `${prefix}-${randomDigits}`;
}
