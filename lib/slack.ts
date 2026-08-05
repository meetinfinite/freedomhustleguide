/**
 * Slack billing notifications.
 *
 * Posts to a Slack Incoming Webhook (one URL = one channel, currently
 * #freedom-hustle-billing in the Infinite workspace). Configure with
 * SLACK_BILLING_WEBHOOK_URL in .env.local and Vercel.
 *
 * Every function here is best-effort and NEVER throws: a Slack outage must
 * not break a checkout or cause Stripe to retry a webhook we already
 * processed. If the env var is unset, these are silent no-ops.
 */

const TIMEOUT_MS = 3000;

/** Format pence → "£5.99". Falls back to the raw amount if currency is odd. */
export function formatMoney(
  amountMinor: number | null | undefined,
  currency = "gbp"
): string {
  if (amountMinor == null) return "—";
  const symbol = { gbp: "£", usd: "$", eur: "€" }[currency.toLowerCase()] ?? "";
  return `${symbol}${(amountMinor / 100).toFixed(2)}`;
}

/** Post a plain-text line to the billing channel. Never throws. */
export async function notifyBilling(text: string): Promise<void> {
  return post(process.env.SLACK_BILLING_WEBHOOK_URL, text);
}

/**
 * Post to the waitlist channel (a different Incoming Webhook → a different
 * channel). Falls back to the billing channel if no dedicated URL is set,
 * so signups are never silently lost.
 */
export async function notifyWaitlist(opts: {
  city: string;
  email: string;
  source?: string | null;
}): Promise<void> {
  const where = opts.source ? `  ·  _${opts.source}_` : "";
  // The footer form posts the sentinel city "Newsletter" (see
  // FooterSubscribe) — label it as such instead of "Waitlist — Newsletter".
  const isNewsletter = opts.city.toLowerCase().startsWith("newsletter");
  const headline = isNewsletter
    ? `📮 *Newsletter signup* — ${opts.email}`
    : `📬 *Waitlist* — ${opts.city} — ${opts.email}`;
  await post(
    process.env.SLACK_WAITLIST_WEBHOOK_URL ||
      process.env.SLACK_BILLING_WEBHOOK_URL,
    `${headline}${where}`
  );
}

/** Shared sender. Never throws; a no-op when the URL is unset. */
async function post(url: string | undefined, text: string): Promise<void> {
  if (!url) return;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    if (!res.ok) {
      console.warn("[slack] post failed", res.status, await res.text());
    }
  } catch (err) {
    console.warn("[slack] post error", err instanceof Error ? err.message : err);
  }
}

/** 🛒 Someone opened Stripe Checkout (not yet paid). */
export async function notifyCheckoutStarted(opts: {
  productLabel: string;
  amountMinor?: number | null;
  currency?: string;
  email?: string | null;
}): Promise<void> {
  const who = opts.email?.trim() || "_not signed in_";
  const amount = formatMoney(opts.amountMinor, opts.currency);
  await notifyBilling(
    `🛒 *Checkout started* — ${opts.productLabel} — ${amount} — ${who}`
  );
}

/** 💰 A payment completed. */
export async function notifyPurchase(opts: {
  productLabel: string;
  amountMinor?: number | null;
  currency?: string;
  email: string;
  isUpgrade?: boolean;
}): Promise<void> {
  const amount = formatMoney(opts.amountMinor, opts.currency);
  const tag = opts.isUpgrade ? " _(existing customer)_" : " _(new customer)_";
  await notifyBilling(
    `💰 *Purchase* — ${opts.productLabel} — *${amount}* — ${opts.email}${tag}`
  );
}
