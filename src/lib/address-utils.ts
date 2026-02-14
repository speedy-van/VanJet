// ─── Address Validation & UK Postcode Detection ─────────────

/**
 * UK postcode regex (covers all valid formats)
 * Examples: SW1A 2AA, M1 1AE, CR2 6XH, DN55 1PT, W1A 0AX, EC1A 1BB
 */
export const UK_POSTCODE_REGEX = /^(GIR\s?0AA|(?:(?:[A-PR-UWYZ][0-9]{1,2}|[A-PR-UWYZ][A-HK-Y][0-9]{1,2}|[A-PR-UWYZ][0-9][A-HJKS-UW]|[A-PR-UWYZ][A-HK-Y][0-9][ABEHMNPRV-Y])\s?[0-9][ABD-HJLNP-UW-Z]{2}))$/i;

/**
 * Check if a string is exactly a UK postcode (and nothing more)
 */
export function isUkPostcodeOnly(address: string): boolean {
  const trimmed = address.trim();
  return UK_POSTCODE_REGEX.test(trimmed);
}

/**
 * Check if address appears to be a full address (has house number + street-like text)
 */
export function isFullAddress(address: string): boolean {
  const trimmed = address.trim();
  
  // If it's just a postcode, not full
  if (isUkPostcodeOnly(trimmed)) return false;
  
  // Check for number at start (house number) or contains common address patterns
  const hasNumber = /^\d+/.test(trimmed) || /\d+\s+[A-Za-z]/.test(trimmed);
  const hasStreetIndicators = /(street|road|avenue|lane|drive|way|place|square|terrace|close|court|crescent|hill|park|gardens|grove)/i.test(trimmed);
  
  // Consider it full if has number OR street indicators AND contains comma (formatted address)
  return (hasNumber || hasStreetIndicators) && trimmed.includes(",");
}

/**
 * Determine address precision based on Mapbox feature type
 */
export function getMapboxPrecision(featureType: string): "full" | "postcode" | "unknown" {
  if (featureType === "address") return "full";
  if (featureType === "postcode") return "postcode";
  return "unknown";
}
