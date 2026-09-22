/**
 * Pay-what-you-want rules, shared by the picker (client) and /api/claim
 * (server) so the two can never disagree.
 *
 * Every guide is free - £0 is a real choice, not a trick. Anything above
 * £0 goes through Stripe Checkout at the amount the reader picked.
 */

/** Preset chips, in pence. */
export const PWYW_PRESETS = [300, 500, 1000] as const;
/** Pre-selected chip. */
export const PWYW_DEFAULT = 500;
/**
 * Smallest paid amount. Stripe's GBP floor is 30p, but below £1 the card
 * fee eats most of it - so it's £0 or £1+.
 */
export const PWYW_MIN_PAID = 100;
/** Sanity cap so a typo (5000 instead of 50) can't become a £5,000 charge. */
export const PWYW_MAX = 50000;

/** "£5" / "£5.50" - drops the pence when they're zero. */
export function formatPounds(pence: number): string {
  const pounds = pence / 100;
  return `£${Number.isInteger(pounds) ? pounds : pounds.toFixed(2)}`;
}

/** Returns an error message, or null when the amount is acceptable. */
export function amountError(pence: number): string | null {
  if (!Number.isInteger(pence) || pence < 0) return "Enter an amount.";
  if (pence > 0 && pence < PWYW_MIN_PAID)
    return `Pay £0, or ${formatPounds(PWYW_MIN_PAID)} or more.`;
  if (pence > PWYW_MAX) return `The most you can pay is ${formatPounds(PWYW_MAX)}.`;
  return null;
}

/** Parse what someone typed ("5", "£7.50", "") into pence, or null. */
export function parsePounds(input: string): number | null {
  const cleaned = input.replace(/[£,\s]/g, "");
  if (cleaned === "") return null;
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  return Math.round(parseFloat(cleaned) * 100);
}
