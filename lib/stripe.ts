import Stripe from "stripe";

/**
 * Server-only Stripe client. Lazy-instantiated so we don't blow up at build
 * time if the key isn't set yet (e.g. local dev without payments).
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env.local and Vercel env vars."
    );
  }
  _stripe = new Stripe(key, {
    apiVersion: "2025-03-31.basil",
    typescript: true
  });
  return _stripe;
}

export const PRICES = {
  LIFETIME: process.env.STRIPE_PRICE_LIFETIME || null
};
