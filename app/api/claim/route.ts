import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getGuide } from "@/lib/guides";
import { grantPurchase } from "@/lib/members";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseServer } from "@/lib/supabase/server";
import { amountError, formatPounds } from "@/lib/pwyw";
import {
  notifyBilling,
  notifyCheckoutStarted,
  notifyWaitlist
} from "@/lib/slack";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ClaimBody {
  /** Guide slug, e.g. "bangkok" */
  guide?: string;
  /** Chosen amount in pence. 0 = free. */
  amount?: number;
  name?: string;
  email?: string;
  /** Ticked "send me new guides" - never assumed. */
  marketingOptIn?: boolean;
  /** Where Stripe sends the reader back to (paid path only). */
  returnPath?: string;
}

/**
 * Pay-what-you-want claim. An email is ALWAYS required - it's the key to
 * the guide (magic-link sign-in), so there's no anonymous access.
 *
 *  - £0      → grant the guide now + email a sign-in link. No Stripe.
 *  - £1+     → Stripe Checkout at that amount; the webhook grants the
 *              guide once it's paid (same as a normal purchase).
 */
export async function POST(req: NextRequest) {
  let body: ClaimBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const guide = getGuide((body.guide || "").trim());
  if (!guide) {
    return NextResponse.json({ error: "Unknown guide" }, { status: 404 });
  }
  if (guide.status !== "live") {
    return NextResponse.json(
      { error: `The ${guide.city} guide isn't out yet.` },
      { status: 409 }
    );
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }
  const name = (body.name || "").trim().slice(0, 80);
  if (!name) {
    return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  }

  const amount = Number(body.amount);
  const badAmount = amountError(amount);
  if (badAmount) {
    return NextResponse.json({ error: badAmount }, { status: 400 });
  }

  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("host") || "freedomhustleguide.com";
  const origin = `${proto}://${host}`;
  const label = `${guide.city} guide`;

  // Newsletter opt-in is recorded on both paths, before any payment, so
  // an abandoned checkout still keeps the signup.
  if (body.marketingOptIn) {
    await saveNewsletterOptIn(email, `pwyw:${guide.slug}`);
  }

  // ---- £0: unlock now ---------------------------------------------------
  if (amount === 0) {
    try {
      await grantPurchase(email, { kind: "guide", slug: guide.slug });
    } catch (err) {
      console.error("[claim] grant failed", err);
      return NextResponse.json(
        { error: "Couldn't unlock the guide. Try again in a minute." },
        { status: 500 }
      );
    }

    await notifyBilling(
      `🎁 *Free claim* — ${label} — £0 — ${email} (${name})`
    );

    // Already signed in as this email? Skip the inbox round-trip.
    const {
      data: { user }
    } = await getSupabaseServer().auth.getUser();
    if (user?.email?.toLowerCase() === email) {
      return NextResponse.json({
        ok: true,
        mode: "free",
        redirect: `/guides/${guide.slug}/app`
      });
    }

    const { error: otpErr } = await getSupabaseAdmin().auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(`/guides/${guide.slug}/app`)}`,
        data: { name }
      }
    });
    if (otpErr) {
      // The guide IS unlocked - they can request a fresh link from the
      // sign-in page - so report success with a nudge rather than an error.
      console.warn("[claim] magic-link send failed", otpErr.message, email);
      return NextResponse.json({ ok: true, mode: "free", emailFailed: true });
    }
    return NextResponse.json({ ok: true, mode: "free" });
  }

  // ---- £1+: Stripe Checkout at the chosen amount ------------------------
  try {
    const stripe = getStripe();
    // Charge against the guide's existing Stripe product so reporting stays
    // grouped per city. Falls back to an inline product if none is wired.
    const priceId =
      guide.stripePriceId ||
      process.env[
        `STRIPE_PRICE_${guide.slug.toUpperCase().replace(/-/g, "_")}`
      ] ||
      null;
    let productId: string | null = null;
    if (priceId) {
      const price = await stripe.prices.retrieve(priceId);
      productId =
        typeof price.product === "string" ? price.product : price.product.id;
    }

    const returnPath = (body.returnPath || `/guides/${guide.slug}`).startsWith(
      "/"
    )
      ? body.returnPath || `/guides/${guide.slug}`
      : `/guides/${guide.slug}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: amount,
            ...(productId
              ? { product: productId }
              : { product_data: { name: `${guide.city} - The Freedom Hustle Guide` } })
          }
        }
      ],
      customer_creation: "always",
      customer_email: email,
      metadata: {
        product: "guide",
        guide_slug: guide.slug,
        name,
        pwyw: "1"
      },
      success_url: `${origin}${returnPath}?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${returnPath}?purchase=cancelled`
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 500 }
      );
    }

    await notifyCheckoutStarted({
      productLabel: `${label} (pay what you want)`,
      amountMinor: amount,
      currency: "gbp",
      email: `${email} (${name})`
    });

    return NextResponse.json({ ok: true, mode: "paid", url: session.url });
  } catch (err) {
    console.error("[claim] checkout failed", err);
    return NextResponse.json(
      {
        error: `Couldn't start the ${formatPounds(amount)} payment. Try again, or pick £0.`
      },
      { status: 500 }
    );
  }
}

/** Same table + Slack channel as the footer newsletter form. Never throws. */
async function saveNewsletterOptIn(email: string, source: string) {
  try {
    const { error } = await getSupabaseAdmin()
      .from("waitlist")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert({ email, city: "Newsletter", source } as any);
    if (error && error.code !== "23505") {
      console.warn("[claim] newsletter insert failed", error.message);
      await notifyWaitlist({
        city: "Newsletter ⚠️ NOT SAVED TO DB",
        email,
        source
      });
      return;
    }
    if (!error) await notifyWaitlist({ city: "Newsletter", email, source });
  } catch (err) {
    console.warn("[claim] newsletter opt-in error", err);
  }
}
