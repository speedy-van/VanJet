// ─── VanJet · Stripe Connect Helpers ──────────────────────────
import Stripe from "stripe";
import { serverEnv, publicEnv, ZERO_COMMISSION_MODE } from "@/lib/env";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

/**
 * Create a Stripe Connect Express account for a new driver.
 */
export async function createDriverStripeAccount(email: string) {
  const stripe = getStripe();
  const account = await stripe.accounts.create({
    type: "express",
    email,
    country: "GB",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: "individual",
  });
  return account;
}

/**
 * Generate an onboarding link so the driver can complete Stripe setup.
 */
export async function createOnboardingLink(stripeAccountId: string) {
  const stripe = getStripe();
  const link = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${publicEnv.APP_URL}/driver/onboarding?refresh=true`,
    return_url: `${publicEnv.APP_URL}/driver/dashboard`,
    type: "account_onboarding",
  });
  return link.url;
}

/**
 * Create a PaymentIntent. If a driver Stripe account is provided,
 * applies the 15% platform fee and sets up transfer to the driver.
 * If no driver yet (direct booking), the platform holds the funds.
 */
export async function createPaymentIntent({
  amountPence,
  driverStripeAccountId,
  metadata,
}: {
  amountPence: number;
  driverStripeAccountId?: string;
  metadata?: Record<string, string>;
}) {
  const stripe = getStripe();

  const params: Stripe.PaymentIntentCreateParams = {
    amount: amountPence,
    currency: "gbp",
    automatic_payment_methods: { enabled: true },
    metadata: metadata ?? {},
  };

  if (driverStripeAccountId) {
    // Zero commission mode: full amount transfers to driver, no application_fee
    if (!ZERO_COMMISSION_MODE) {
      // Fallback for non-zero commission mode (not currently active)
      console.warn("[VanJet] ZERO_COMMISSION_MODE is disabled - this is unexpected in production.");
    }
    params.transfer_data = { destination: driverStripeAccountId };
  }

  const intent = await stripe.paymentIntents.create(params);

  return {
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
  };
}
