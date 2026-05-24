import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getMember, grantPurchase } from "@/lib/members";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.warn(
      "[stripe-webhook] signature verification failed",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // We only care about completed checkouts. Refunds/disputes can come later.
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const email = (session.customer_details?.email || session.customer_email || "")
    .trim()
    .toLowerCase();
  const product = session.metadata?.product as "lifetime" | "guide" | undefined;
  const guideSlug = session.metadata?.guide_slug;
  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : null;

  if (!email) {
    console.warn("[stripe-webhook] no email on session", session.id);
    return NextResponse.json({ received: true, error: "no email" });
  }
  if (!product) {
    console.warn("[stripe-webhook] no product metadata on session", session.id);
    return NextResponse.json({ received: true, error: "no product" });
  }

  try {
    // Check if this is a first-time buyer or an upgrade
    const existingMember = await getMember(email);
    const isUpgrade = Boolean(existingMember);

    // 1. Record the purchase
    if (product === "lifetime") {
      await grantPurchase(email, { kind: "lifetime" }, stripeCustomerId);
    } else if (product === "guide" && guideSlug) {
      await grantPurchase(
        email,
        { kind: "guide", slug: guideSlug },
        stripeCustomerId
      );
    } else {
      throw new Error(`unknown product shape: ${product} / ${guideSlug}`);
    }

    // 2. For NEW buyers, send a magic-link so they can sign in for the first
    //    time. Existing members already have an account + session — skip the
    //    OTP send. Their dashboard will reflect the upgrade automatically.
    if (!isUpgrade) {
      const supabase = getSupabaseAdmin();
      const proto = req.headers.get("x-forwarded-proto") || "https";
      const host = req.headers.get("host") || "freedomhustleguide.com";
      const redirectTo = `${proto}://${host}/auth/callback?next=/my`;

      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectTo
        }
      });
      if (otpErr) {
        // Purchase is recorded; sign-in email failed. Don't blow up the
        // webhook (Stripe would retry forever), just log it.
        console.warn(
          "[stripe-webhook] purchase recorded but magic-link send failed",
          otpErr.message,
          email
        );
      }
    }
  } catch (err) {
    console.error("[stripe-webhook] processing failed", err);
    // Return 500 so Stripe retries
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
