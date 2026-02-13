// ─── VanJet · Stripe Client (browser) ────────────────────────
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { publicEnv } from "@/lib/env";

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripeClient() {
  if (!stripePromise) {
    stripePromise = loadStripe(publicEnv.STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}
