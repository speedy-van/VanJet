// ─── VanJet Environment Validator ───────────────────────────────
// Single source of truth for all environment variables.
// Fails fast with a clear English error if a required env var is missing.
// All access to process.env must go through this module.

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

function requiredPublic(name: string): string {
  const fullName = `NEXT_PUBLIC_${name}`;
  const value = process.env[fullName];
  if (!value) {
    console.warn(
      `[VanJet] Missing client environment variable: ${fullName}. ` +
        `Add it to .env.local. Some features may be disabled.`
    );
    return "";
  }
  return value;
}

/** Server-only env vars (never exposed to browser). */
export const serverEnv = {
  // ── Required ──────────────────────────────────────────────────
  get DATABASE_URL() {
    return required("DATABASE_URL");
  },
  get NEXTAUTH_SECRET() {
    return required("NEXTAUTH_SECRET");
  },
  
  // ── Optional: Payments ────────────────────────────────────────
  get STRIPE_SECRET_KEY() {
    return optional("STRIPE_SECRET_KEY");
  },
  get STRIPE_WEBHOOK_SECRET() {
    return optional("STRIPE_WEBHOOK_SECRET");
  },
  
  // ── Optional: External Services ───────────────────────────────
  get GROK_API_KEY() {
    return optional("GROK_API_KEY");
  },
  get RESEND_API_KEY() {
    return optional("RESEND_API_KEY");
  },
  get VOODOO_SMS_API_KEY() {
    return optional("VOODOO_SMS_API_KEY");
  },
  
  // ── Optional: Rate Limiting ───────────────────────────────────
  get UPSTASH_REDIS_REST_URL() {
    return optional("UPSTASH_REDIS_REST_URL");
  },
  get UPSTASH_REDIS_REST_TOKEN() {
    return optional("UPSTASH_REDIS_REST_TOKEN");
  },
  
  // ── Optional: NextAuth ────────────────────────────────────────
  get NEXTAUTH_URL() {
    return optional("NEXTAUTH_URL");
  },
  
  // ── Optional: Admin Bootstrap (dev only) ──────────────────────
  get ADMIN_EMAIL() {
    return optional("ADMIN_EMAIL");
  },
  get ADMIN_PASSWORD() {
    return optional("ADMIN_PASSWORD");
  },
  
  // ── Optional: Pricing Configuration ───────────────────────────
  get PRICING_PROFILE() {
    return optional("PRICING_PROFILE") || "competitive";
  },
  get ENABLE_VAT() {
    return optional("ENABLE_VAT") === "true";
  },
  get PRICING_DEBUG() {
    return optional("PRICING_DEBUG") === "true";
  },
  get ENABLE_AI_PRICING() {
    return optional("ENABLE_AI_PRICING") === "true";
  },
  
  // ── Optional: Debug/Dev ───────────────────────────────────────
  get DEV_DRIVER_KEY() {
    return optional("DEV_DRIVER_KEY");
  },
  
  // ── Optional: Two-Factor Encryption ───────────────────────────
  get TWO_FACTOR_ENCRYPTION_KEY() {
    return optional("TWO_FACTOR_ENCRYPTION_KEY");
  },
  
  // ── Optional: Feature Toggles ─────────────────────────────────
  get ZERO_COMMISSION_MODE() {
    return optional("ZERO_COMMISSION_MODE") === "true";
  },
} as const;

/** Public env vars (available in browser via NEXT_PUBLIC_ prefix). */
export const publicEnv = {
  // ── Required for core functionality ───────────────────────────
  // MAPBOX_TOKEN: Restrict this token to your site's domain via Mapbox dashboard
  // to prevent unauthorized usage (Settings → Access tokens → URL restrictions).
  MAPBOX_TOKEN: requiredPublic("MAPBOX_TOKEN"),
  STRIPE_PUBLISHABLE_KEY: requiredPublic("STRIPE_PUBLISHABLE_KEY"),
  
  // ── Optional: App URL ─────────────────────────────────────────
  APP_URL: optional("NEXT_PUBLIC_URL") || "http://localhost:3000",
  
  // ── Optional: Analytics ───────────────────────────────────────
  GA_ID: optional("NEXT_PUBLIC_GA_ID"),
  GTM_ID: optional("NEXT_PUBLIC_GTM_ID"),
} as const;
