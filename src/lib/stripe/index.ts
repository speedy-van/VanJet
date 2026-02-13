// ─── VanJet · Stripe Connect Helpers ──────────────────────────
import Stripe from "stripe";
import { serverEnv, publicEnv } from "@/lib/env";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

/**
 * Platform fee percentage applied on every booking payment.
 */
export const PLATFORM_FEE_PERCENT = 15;

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
    const feeAmount = Math.round(
      amountPence * (PLATFORM_FEE_PERCENT / 100)
    );
    params.application_fee_amount = feeAmount;
    params.transfer_data = { destination: driverStripeAccountId };
  }

  const intent = await stripe.paymentIntents.create(params);

  return {
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
  };
}
