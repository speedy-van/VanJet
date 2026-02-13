#!/usr/bin/env node

// ─── VanJet · Vercel Environment Variables Setup ──────────────
// Run: node scripts/setup-vercel-env.mjs
//
// This script outputs all the `vercel env add` commands you need
// to run to configure production environment variables.
// Review each value, then paste into your terminal.
// ──────────────────────────────────────────────────────────────

const envVars = [
  {
    name: "DATABASE_URL",
    value: "<your-neon-production-connection-string>",
    sensitive: true,
    targets: ["production", "preview"],
    note: "Neon Postgres. Use pooled connection string for serverless.",
  },
  {
    name: "NEXT_PUBLIC_MAPBOX_TOKEN",
    value: "<your-mapbox-public-token>",
    sensitive: false,
    targets: ["production", "preview"],
    note: "Mapbox GL public access token (GB geocoding).",
  },
  {
    name: "STRIPE_SECRET_KEY",
    value: "<sk_live_...>",
    sensitive: true,
    targets: ["production"],
    note: "Stripe LIVE secret key. Use sk_test_ for preview.",
  },
  {
    name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    value: "<pk_live_...>",
    sensitive: false,
    targets: ["production"],
    note: "Stripe LIVE publishable key. Use pk_test_ for preview.",
  },
  {
    name: "STRIPE_WEBHOOK_SECRET",
    value: "<whsec_...>",
    sensitive: true,
    targets: ["production"],
    note: "From Stripe Dashboard → Webhooks → Signing secret.",
  },
  {
    name: "NEXTAUTH_SECRET",
    value: "jB3c6qW9/gPA8NCd7N0FDpvH3f08GsLKf5mA7vo2p60=",
    sensitive: true,
    targets: ["production", "preview"],
    note: "JWT signing secret. Pre-generated — change if desired.",
  },
  {
    name: "NEXTAUTH_URL",
    value: "https://vanjet.com",
    sensitive: false,
    targets: ["production"],
    note: "Must match your production domain exactly.",
  },
  {
    name: "NEXT_PUBLIC_URL",
    value: "https://vanjet.com",
    sensitive: false,
    targets: ["production"],
    note: "Public-facing app URL.",
  },
  {
    name: "ADMIN_EMAIL",
    value: "<admin@vanjet.com>",
    sensitive: true,
    targets: ["production", "preview"],
    note: "Admin dashboard login email.",
  },
  {
    name: "ADMIN_PASSWORD",
    value: "<strong-production-password>",
    sensitive: true,
    targets: ["production", "preview"],
    note: "Admin dashboard login password. Use a strong unique value.",
  },
  {
    name: "GROK_API_KEY",
    value: "<your-grok-api-key>",
    sensitive: true,
    targets: ["production", "preview"],
    note: "Optional: Grok (xAI) API key for AI pricing validation.",
  },
  {
    name: "ENABLE_AI_PRICING",
    value: "true",
    sensitive: false,
    targets: ["production", "preview"],
    note: "Set to 'true' to enable Grok price validation.",
  },
  {
    name: "RESEND_API_KEY",
    value: "<re_...>",
    sensitive: true,
    targets: ["production"],
    note: "Optional: Resend API key for transactional emails.",
  },
  {
    name: "VOODOO_SMS_API_KEY",
    value: "",
    sensitive: true,
    targets: ["production"],
    note: "Optional: VoodooSMS API key for SMS notifications.",
  },
];

console.log("╔══════════════════════════════════════════════════════╗");
console.log("║  VanJet — Vercel Production Environment Setup       ║");
console.log("╚══════════════════════════════════════════════════════╝");
console.log("");
console.log("Run these commands in your terminal (from project root):");
console.log("Make sure you have Vercel CLI installed: npm i -g vercel");
console.log("And are linked to your project: vercel link");
console.log("");
console.log("────────────────────────────────────────────────────────");
console.log("");

for (const env of envVars) {
  console.log(`# ${env.note}`);
  for (const target of env.targets) {
    console.log(
      `echo "${env.value}" | vercel env add ${env.name} ${target}${env.sensitive ? " --sensitive" : ""}`
    );
  }
  console.log("");
}

console.log("────────────────────────────────────────────────────────");
console.log("");
console.log("After setting all variables:");
console.log("  1. vercel --prod          # Deploy to production");
console.log("  2. npm run db:push        # Sync database schema");
console.log("  3. Test: https://vanjet.com");
console.log("  4. Set up Stripe webhook: https://vanjet.com/api/webhooks/stripe");
console.log("");

console.log("╔══════════════════════════════════════════════════════╗");
console.log("║  Environment Variable Summary                       ║");
console.log("╠══════════════════════════════════════════════════════╣");

const maxLen = Math.max(...envVars.map((e) => e.name.length));
for (const env of envVars) {
  const pad = " ".repeat(maxLen - env.name.length);
  const sens = env.sensitive ? "🔒" : "  ";
  const targets = env.targets.join(", ");
  console.log(`║  ${sens} ${env.name}${pad}  ${targets}`);
}

console.log("╚══════════════════════════════════════════════════════╝");
