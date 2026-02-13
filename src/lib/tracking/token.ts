// ─── VanJet · Tracking Token Generator ─────────────────────────
import { randomBytes } from "crypto";

/**
 * Generate a secure, URL-safe tracking token (32 chars).
 * Used so customers can view live tracking without exposing bookingId.
 */
export function generateTrackingToken(): string {
  return randomBytes(18).toString("base64url"); // 24 chars, URL-safe
}
