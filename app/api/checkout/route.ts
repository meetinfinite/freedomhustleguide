import { NextRequest, NextResponse } from "next/server";
import { getStripe, PRICES } from "@/lib/stripe";
import { getGuide } from "@/lib/guides";

export const runtime = "nodejs";

interface CheckoutBody {
  /** Either a guide slug (single-guide purchase) or "lifetime" */
  product: string;
  /** Where to send the buyer after checkout */
  returnPath?: string;
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
    priceId = guide.stripePriceId;
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

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      // Stripe collects the email at checkout — we read it from the webhook
      // to provision the member and send their magic-link sign-in email.
      customer_creation: "always",
      allow_promotion_codes: true,
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
