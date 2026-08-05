import { NextRequest, NextResponse } from "next/server";
import { getStripe, PRICES } from "@/lib/stripe";
import { getGuide } from "@/lib/guides";
import { notifyCheckoutStarted } from "@/lib/slack";

export const runtime = "nodejs";

interface CheckoutBody {
  /** Either a guide slug (single-guide purchase) or "lifetime" */
  product: string;
  /** Where to send the buyer after checkout */
  returnPath?: string;
  /** Pre-fill the email field on Stripe Checkout (used when signed-in user upgrades) */
  customerEmail?: string;
}

/** Look up a city's Stripe Price ID by convention: STRIPE_PRICE_<SLUG>. */
function envPriceFor(slug: string): string | null {
  const key = `STRIPE_PRICE_${slug.toUpperCase().replace(/-/g, "_")}`;
  return process.env[key] || null;
}

export async function POST(req: NextRequest) {
  let body: CheckoutBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const product = (body.product || "").trim();
  if (!product) {
    return NextResponse.json({ error: "Missing product" }, { status: 400 });
  }

  // Resolve which Stripe Price ID to charge
  let priceId: string | null = null;
  let label: string;
  let metadata: Record<string, string> = {};
  if (product === "lifetime") {
    priceId = PRICES.LIFETIME;
    label = "Lifetime Access";
    metadata = { product: "lifetime" };
  } else {
    const guide = getGuide(product);
    if (!guide) {
      return NextResponse.json({ error: "Unknown product" }, { status: 404 });
    }
    // Every city has a Stripe price, but only written guides are on sale.
    // Without this, a direct POST could buy a "coming soon" city and land
    // the buyer on 404 chapters.
    if (guide.status !== "live") {
      return NextResponse.json(
        { error: `The ${guide.city} guide isn't on sale yet.` },
        { status: 409 }
      );
    }
    // Prefer the explicitly-wired price, else fall back to the per-city
    // env var (STRIPE_PRICE_CHIANG_MAI etc). The fallback means a new city
    // only needs its env var set — no code change.
    priceId = guide.stripePriceId || envPriceFor(guide.slug);
    label = `${guide.city} guide`;
    metadata = { product: "guide", guide_slug: guide.slug };
  }

  if (!priceId) {
    return NextResponse.json(
      {
        error: `No Stripe price configured for "${product}". Add STRIPE_PRICE_${product.toUpperCase().replace(/-/g, "_")} to env.`
      },
      { status: 500 }
    );
  }

  // Build success / cancel URLs
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("host") || "freedomhustleguide.com";
  const origin = `${proto}://${host}`;
  const returnPath = body.returnPath || "/";

  // Lifetime is advertised as "£180 → £79 with code FREEDOM". Apply that
  // coupon automatically so the buyer never has to type it (and can never
  // be charged the full £180 by missing it). Stripe forbids combining
  // `discounts` with `allow_promotion_codes`, so it's one or the other.
  const freedomCoupon = process.env.STRIPE_COUPON_FREEDOM;
  const autoDiscount = product === "lifetime" && Boolean(freedomCoupon);

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_creation: "always",
      // Pre-fill email when buyer is already signed in
      ...(body.customerEmail
        ? { customer_email: body.customerEmail.trim().toLowerCase() }
        : {}),
      ...(autoDiscount
        ? { discounts: [{ coupon: freedomCoupon as string }] }
        : { allow_promotion_codes: true }),
      // NOTE: what buyers see on their bank statement comes from the
      // Stripe *account* descriptor (Settings → Business → Public details).
      // Per-payment overrides don't work here — this account silently
      // ignores both `statement_descriptor` and `..._suffix` (verified
      // against the live API), so it can only be changed in the dashboard.
      metadata,
      success_url: `${origin}${returnPath}?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${returnPath}?purchase=cancelled`
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 500 }
      );
    }

    // Best-effort Slack ping — never blocks or fails the checkout.
    await notifyCheckoutStarted({
      productLabel: label,
      amountMinor: session.amount_total,
      currency: session.currency ?? "gbp",
      email: body.customerEmail ?? null
    });

    return NextResponse.json({ url: session.url, label });
  } catch (err) {
    console.error("[checkout] failed", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not start checkout."
      },
      { status: 500 }
    );
  }
}
