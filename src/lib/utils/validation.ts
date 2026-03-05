// ─── VanJet · Input Validation Helpers ────────────────────────
// UK-specific validation for postcodes, phone numbers, and item data.

/**
 * Validate a UK postcode format.
 * Accepts common formats like "SW1A 1AA", "EC1A1BB", "W1 0AX", "M1 1AE".
 * Returns the normalised postcode (uppercase, with space) or null if invalid.
 */
export function validateUKPostcode(input: string): string | null {
  if (!input || typeof input !== "string") return null;

  // Remove extra spaces and uppercase
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, " ");

  // UK postcode regex (comprehensive)
  const postcodeRegex =
    /^([A-Z]{1,2}\d[A-Z\d]?)\s?(\d[A-Z]{2})$/;

  const match = cleaned.match(postcodeRegex);
  if (!match) return null;

  // Return normalised with space
  return `${match[1]} ${match[2]}`;
}

/**
 * Extract postcode from a full UK address string.
 * Returns the postcode if found, null otherwise.
 */
export function extractPostcodeFromAddress(address: string): string | null {
  if (!address) return null;
  // Look for postcode-like pattern anywhere in the string
  const postcodeRegex =
    /\b([A-Z]{1,2}\d[A-Z\d]?)\s?(\d[A-Z]{2})\b/i;
  const match = address.match(postcodeRegex);
  if (!match) return null;
  return `${match[1].toUpperCase()} ${match[2].toUpperCase()}`;
}

/**
 * Validate a UK phone number.
 * Returns normalised E.164 format or null if invalid.
 */
export function validateUKPhone(input: string): string | null {
  if (!input || typeof input !== "string") return null;

  let cleaned = input.replace(/[\s\-()]/g, "");

  // Convert 07... → +447...
  if (cleaned.startsWith("0")) {
    cleaned = "+44" + cleaned.slice(1);
  } else if (cleaned.startsWith("44") && !cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }

  // Must be +44 followed by 10 digits
  if (/^\+44\d{10}$/.test(cleaned)) {
    return cleaned;
  }

  return null;
}

/**
 * Validate an email address (basic RFC-compliant check).
 */
export function validateEmail(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim());
}

/**
 * Validate move date is not in the past.
 */
export function validateMoveDate(dateStr: string): { valid: boolean; date?: Date; error?: string } {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { valid: false, error: "Invalid date format. Use ISO 8601." };
  }

  const now = new Date();
  // Allow same-day bookings but not past dates
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const moveDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (moveDay < today) {
    return { valid: false, error: "Move date cannot be in the past." };
  }

  // Max 1 year in the future
  const maxDate = new Date(today);
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  if (moveDay > maxDate) {
    return { valid: false, error: "Move date cannot be more than 1 year in the future." };
  }

  return { valid: true, date };
}

/**
 * Validate and sanitise item data.
 * Returns cleaned items or an error message.
 */
export function validateItems(
  items: Array<{
    name?: string;
    quantity?: number;
    weightKg?: number;
    volumeM3?: number;
    [key: string]: unknown;
  }>
): { valid: boolean; error?: string } {
  if (!Array.isArray(items)) {
    return { valid: false, error: "Items must be an array." };
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (!item.name || typeof item.name !== "string" || item.name.trim().length === 0) {
      return { valid: false, error: `Item ${i + 1}: name is required.` };
    }

    if (item.quantity != null && (typeof item.quantity !== "number" || item.quantity < 1 || item.quantity > 100)) {
      return { valid: false, error: `Item ${i + 1}: quantity must be between 1 and 100.` };
    }

    if (item.weightKg != null && (typeof item.weightKg !== "number" || item.weightKg < 0 || item.weightKg > 5000)) {
      return { valid: false, error: `Item ${i + 1}: weight must be between 0 and 5000 kg.` };
    }

    if (item.volumeM3 != null && (typeof item.volumeM3 !== "number" || item.volumeM3 < 0 || item.volumeM3 > 100)) {
      return { valid: false, error: `Item ${i + 1}: volume must be between 0 and 100 m³.` };
    }
  }

  return { valid: true };
}
