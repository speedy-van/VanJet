// ─── VanJet Environment Validator ───────────────────────────────
// Fails fast with a clear English error if a required env var is missing.

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[VanJet] Missing required environment variable: ${name}. ` +
        `Add it to .env.local and restart the server.`
    );
  }
  return value;
}

function optional(name: string): string {
  return process.env[name] ?? "";
}

/** Server-only env vars (never exposed to browser). */
export const serverEnv = {
  get DATABASE_URL() {
    return required("DATABASE_URL");
  },
  get STRIPE_SECRET_KEY() {
    return optional("STRIPE_SECRET_KEY");
  },
  get STRIPE_WEBHOOK_SECRET() {
    return optional("STRIPE_WEBHOOK_SECRET");
  },
  get GROK_API_KEY() {
    return optional("GROK_API_KEY");
  },
  get RESEND_API_KEY() {
    return optional("RESEND_API_KEY");
  },
  get VOODOO_SMS_API_KEY() {
    return optional("VOODOO_SMS_API_KEY");
  },
} as const;

/** Public env vars (available in browser via NEXT_PUBLIC_ prefix). */
export const publicEnv = {
  MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "",
  STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  APP_URL: process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000",
} as const;

/**
 * Zero Commission Mode: When true, platform takes 0% fee.
 * Customer pays Y (driver quote), driver receives Y.
 */
export const ZERO_COMMISSION_MODE =
  process.env.ZERO_COMMISSION_MODE === "true";
