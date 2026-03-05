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
 * applies the platform fee and sets up transfer to the driver.
 * If no driver yet (direct booking), the platform holds the funds.
 *
 * Fee structure:
 *   - ZERO_COMMISSION_MODE=true  → full amount to driver, no platform fee
 *   - ZERO_COMMISSION_MODE=false → 15% platform fee (configurable via PLATFORM_FEE_PERCENT)
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
    if (serverEnv.ZERO_COMMISSION_MODE) {
      // Zero commission: full amount to driver
      params.transfer_data = { destination: driverStripeAccountId };
    } else {
      // Platform takes a fee (default 15%)
      const feePercent = parseFloat(process.env.PLATFORM_FEE_PERCENT || "15");
      const applicationFeePence = Math.round(amountPence * (feePercent / 100));
      params.application_fee_amount = applicationFeePence;
      params.transfer_data = { destination: driverStripeAccountId };
    }
  }

  const intent = await stripe.paymentIntents.create(params);

  return {
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
  };
}

/**
 * Issue a refund for a PaymentIntent.
 * @param paymentIntentId - The Stripe PaymentIntent ID
 * @param amountPence - Omit for full refund, or specify partial amount in pence
 * @returns The Stripe Refund object
 */
export async function issueRefund({
  paymentIntentId,
  amountPence,
  reason,
}: {
  paymentIntentId: string;
  amountPence?: number;
  reason?: "requested_by_customer" | "duplicate" | "fraudulent";
}) {
  const stripe = getStripe();
  const params: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
    reason: reason ?? "requested_by_customer",
  };
  if (amountPence != null && amountPence > 0) {
    params.amount = amountPence;
  }
  return stripe.refunds.create(params);
}
