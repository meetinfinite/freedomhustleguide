/**
 * One-shot Stripe setup for the guide store.
 *
 * Creates (or reuses, if already there) everything the site needs:
 *   - one Product + £5.99 GBP Price per guide in lib/guides.ts
 *   - the Lifetime Product + £180 GBP Price
 *   - the FREEDOM coupon (£101 off → £79)
 *   - the checkout.session.completed webhook pointing at production
 *
 * It is IDEMPOTENT: re-running it finds existing objects by their
 * `fh_key` metadata instead of creating duplicates. Nothing is deleted.
 *
 * Run:
 *   set -a && source .env.local && set +a && node scripts/stripe-setup.mjs
 *
 * Add --commit to actually write. Without it, this is a dry run that only
 * prints what it *would* do.
 */

import Stripe from "stripe";
import fs from "node:fs";

const COMMIT = process.argv.includes("--commit");
const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("✗ STRIPE_SECRET_KEY not set. Source .env.local first.");
  process.exit(1);
}
const LIVE = key.startsWith("sk_live_");
const stripe = new Stripe(key);

const GUIDE_PRICE_PENCE = 599; // £5.99
const LIFETIME_PENCE = 18000; // £180
const FREEDOM_OFF_PENCE = 10100; // −£101 → £79
const WEBHOOK_URL = "https://freedomhustleguide.com/api/webhooks/stripe";

console.log(
  `\n${LIVE ? "🔴 LIVE MODE — real money" : "🧪 TEST MODE — fake money"}` +
    `${COMMIT ? "" : "   (dry run — pass --commit to apply)"}\n`
);

// ---- read the guide list straight out of lib/guides.ts ----
const src = fs.readFileSync("lib/guides.ts", "utf8");
const guides = [];
const re = /slug:\s*"([a-z0-9-]+)",\s*\n\s*title:\s*"([^"]+)",\s*\n\s*city:\s*"([^"]+)"/g;
let m;
while ((m = re.exec(src))) guides.push({ slug: m[1], city: m[3] });
if (!guides.length) {
  console.error("✗ Could not parse any guides from lib/guides.ts");
  process.exit(1);
}
console.log(`Found ${guides.length} guides in lib/guides.ts\n`);

// ---- helpers ----
async function findByKey(type, fhKey) {
  // Search API is eventually-consistent right after creation, so we page
  // the list endpoints instead — small object counts make this cheap.
  const list =
    type === "product"
      ? await stripe.products.list({ limit: 100, active: true })
      : await stripe.coupons.list({ limit: 100 });
  return list.data.find((o) => o.metadata?.fh_key === fhKey) || null;
}

async function ensureProductWithPrice({ fhKey, name, pence }) {
  let product = await findByKey("product", fhKey);
  if (!product) {
    if (!COMMIT) return { created: true, priceId: "(dry-run)" };
    product = await stripe.products.create({
      name,
      metadata: { fh_key: fhKey }
    });
  }
  // Reuse an active price with the right amount if one exists
  const prices = await stripe.prices.list({ product: product.id, limit: 100 });
  const match = prices.data.find(
    (p) => p.active && p.unit_amount === pence && p.currency === "gbp"
  );
  if (match) return { created: false, priceId: match.id };
  if (!COMMIT) return { created: true, priceId: "(dry-run)" };
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: pence,
    currency: "gbp",
    metadata: { fh_key: fhKey }
  });
  return { created: true, priceId: price.id };
}

// ---- guides ----
const env = {};
console.log("Guides (£5.99 each)");
for (const g of guides) {
  const fhKey = `guide:${g.slug}`;
  const { created, priceId } = await ensureProductWithPrice({
    fhKey,
    name: `Freedom Hustle Guide to ${g.city}`,
    pence: GUIDE_PRICE_PENCE
  });
  const envName = `STRIPE_PRICE_${g.slug.toUpperCase().replace(/-/g, "_")}`;
  env[envName] = priceId;
  console.log(`  ${created ? "＋" : "=" } ${g.city.padEnd(18)} ${priceId}`);
}

// ---- lifetime ----
console.log("\nLifetime (£180 list)");
const lifetime = await ensureProductWithPrice({
  fhKey: "lifetime",
  name: "Freedom Hustle — Lifetime Access (all guides)",
  pence: LIFETIME_PENCE
});
env.STRIPE_PRICE_LIFETIME = lifetime.priceId;
console.log(`  ${lifetime.created ? "＋" : "="} Lifetime          ${lifetime.priceId}`);

// ---- FREEDOM coupon ----
console.log("\nFREEDOM coupon (−£101 → £79)");
let coupon = await findByKey("coupon", "freedom");
if (!coupon && COMMIT) {
  coupon = await stripe.coupons.create({
    name: "FREEDOM",
    amount_off: FREEDOM_OFF_PENCE,
    currency: "gbp",
    duration: "once",
    metadata: { fh_key: "freedom" }
  });
}
// A promotion code makes "FREEDOM" typeable by customers too. Optional —
// the coupon is auto-applied at checkout regardless — so never let this
// step abort the rest of the setup (the API shape has changed between
// Stripe versions).
if (coupon && COMMIT) {
  try {
    const existing = await stripe.promotionCodes.list({ code: "FREEDOM", limit: 1 });
    if (!existing.data.length) {
      await stripe.promotionCodes.create({ coupon: coupon.id, code: "FREEDOM" });
      console.log("  ＋ promotion code FREEDOM");
    }
  } catch (err) {
    console.log(`  ⚠️  promotion code skipped (${err.message.split("\n")[0]})`);
  }
}
env.STRIPE_COUPON_FREEDOM = coupon?.id || "(dry-run)";
console.log(`  ${coupon ? "=" : "＋"} coupon id         ${env.STRIPE_COUPON_FREEDOM}`);

// ---- webhook ----
console.log("\nWebhook");
const hooks = await stripe.webhookEndpoints.list({ limit: 100 });
let hook = hooks.data.find((h) => h.url === WEBHOOK_URL && h.status === "enabled");
let hookSecret = null;
if (!hook && COMMIT) {
  hook = await stripe.webhookEndpoints.create({
    url: WEBHOOK_URL,
    enabled_events: ["checkout.session.completed"]
  });
  hookSecret = hook.secret; // only returned at creation time
}
console.log(
  hook
    ? `  = ${WEBHOOK_URL} (${hook.status})`
    : `  ＋ would create ${WEBHOOK_URL}`
);
if (hookSecret) env.STRIPE_WEBHOOK_SECRET = hookSecret;

// ---- output ----
console.log("\n" + "=".repeat(64));
console.log("PASTE THESE INTO VERCEL → Settings → Environment Variables");
console.log("=".repeat(64));
for (const [k, v] of Object.entries(env)) console.log(`${k}=${v}`);
if (!hookSecret && hook) {
  console.log(
    "\n(STRIPE_WEBHOOK_SECRET not shown — the endpoint already existed.\n" +
      " Get it from Stripe → Developers → Webhooks → click the endpoint →\n" +
      " 'Reveal' the signing secret.)"
  );
}
if (!COMMIT) console.log("\n⚠️  DRY RUN — nothing was created. Re-run with --commit");
console.log("");
