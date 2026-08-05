# Guide rollout checklist

Step-by-step for taking a new city guide from "soon" to live. Worked
example: **Chiang Mai**. Replace `<city>` / `<CITY>` accordingly
(slug `chiang-mai`, env suffix `CHIANG_MAI`).

> **Payments are already done for every city.** All 30 cities in
> `lib/guides.ts` have a live £5.99 Stripe price, and its `STRIPE_PRICE_<CITY>`
> is already set in Vercel (created by `scripts/stripe-setup.mjs`). So a new
> guide needs **no Stripe work** — it becomes sellable the moment its
> `status` flips to `"live"`. `/api/checkout` refuses any guide that isn't
> live, so an unwritten city can never be bought by accident.
>
> **The whole job for a new city is: write it in Notion → connect it →
> wire the page IDs → flip status → deploy.** Steps 1–3, 6, 7 below.

The single source of truth for guide content is **Notion**, read via the
`NOTION_TOKEN` integration **"Freedom Hustle Site"** (workspace *Infinite
Studio*). The site reads structure from `lib/guides.ts`.

---

## 1. Notion — author + connect

1. Author the guide as a top-level page **"Master <City> - The Freedom
   Hustle Guide"** with one subpage per section, named like the Bangkok
   tree: `01 · First 24 Hours`, `02 · Visa & Immigration`, … (the `NN ·`
   prefix is stripped automatically for the page H1).
2. **Connect the master page to the integration:** open the master page →
   `⋯` menu → **Connections** → add **"Freedom Hustle Site"**. Subpages
   inherit the connection. Until this is done the site sees nothing.

> The connected MCP Notion server (`notion-search`/`fetch`) points at a
> different, empty workspace — it will NOT find guide pages. Use the
> `NOTION_TOKEN` scripts below.

## 2. Pull the section page IDs

```bash
set -a && source .env.local && set +a
node scripts/notion-probe.mjs          # lists every page the integration sees
```

To list a master page's children directly (gives the per-section IDs),
adapt `scripts/notion-inspect.mjs` or run a `blocks.children.list` on the
master id.

## 3. Wire it into `lib/guides.ts`

1. Add a `<CITY>_SECTION_OVERRIDES: SectionOverrides` block mapping each
   section slug → its `notionPageId` (mirror `BANGKOK_SECTION_OVERRIDES`).
2. `const <CITY>_SECTIONS = buildSections(<CITY>_SECTION_OVERRIDES);`
3. In the guide's `GUIDES` entry:
   - `sections: <CITY>_SECTIONS`
   - `status: "live"` (was `"soon"`)
   - `stripePriceId: process.env.STRIPE_PRICE_<CITY> || null`
   - set a real `heroImage` if you have one (empty string is fine — the
     landing hero falls back to `cardImage`); set `cardImage`
   - optional: `myMapsId` for the in-app city map

⚠️ **Only keep sections that have a Notion page _or_ an MDX fallback.**
A template section with neither renders a dead 404 card on the dashboard.
(The `wifi-sim-apps` section was removed from `SECTION_TEMPLATE` for exactly
this reason — its content now lives in Digital Nomad Toolkit. Don't re-add it.)

## 4. Stripe — nothing to do

Every city already has a live £5.99 price and its `STRIPE_PRICE_<CITY>`
env var in Vercel. Checkout resolves the price by convention
(`STRIPE_PRICE_` + the slug in caps, dashes → underscores), so no code or
env change is needed.

Only relevant if you add a **brand-new city** that isn't in `lib/guides.ts`
yet: re-run `node scripts/stripe-setup.mjs --commit` to create its price,
then add the printed `STRIPE_PRICE_<CITY>` to Vercel. The script is
idempotent — it never duplicates what already exists.

## 5. Access / members

Gating is Supabase-auth + the `members` table (`lib/members.ts`):
- **Lifetime members** (`lifetime = true`) → all live guides, automatically.
- **Single-guide buyers** → the Stripe webhook (`app/api/webhooks/stripe`)
  calls `grantPurchase`, appending the slug to `members.guides`.
- **Manual comps** → upsert the `members` row (set `lifetime` or add the
  slug to `guides[]`).

No new access config is required to make a guide _visible_ to existing
lifetime members — only the deploy in step 7.

## 6. Verify locally

```bash
npx tsc --noEmit
npm run dev
```

Check:
- `/guides/<city>` → 200 (public landing renders, hero present)
- `/guides/<city>/app` → dashboard lists every section, all links resolve
- open 2–3 sections — Notion content renders (headings, callouts, tables,
  PlaceCards). Tagged quotes map to cards: `DON'T`/`HEADS UP`/`CAUTION` →
  ⚠️ WarningCard, `PRO TIP` / `GOOD TO KNOW` → ✦ ProTip.
- visit each `/guides/<city>/app/<slug>` directly — **none should 404**
- `/my` while signed in as a lifetime member shows the new guide card

## 7. Commit, push, deploy

1. Commit on a branch → PR → merge.
2. Confirm **Vercel env vars** exist: `NOTION_TOKEN`, `STRIPE_SECRET_KEY`,
   `STRIPE_PRICE_LIFETIME`, `STRIPE_PRICE_<CITY>`, `NEXT_PUBLIC_SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `GOOGLE_PLACES_API_KEY`.
3. Deploy. **A status flip only goes live in production after deploy** —
   editing `lib/guides.ts` locally does nothing for the live site.
   Section pages revalidate from Notion every 60s (`revalidate = 60`).

## 8. Post-deploy smoke test

- Production `/guides/<city>` and `/guides/<city>/app` load.
- `/my` (lifetime member) shows the new card → "Open guide" works.
- One section page renders Notion content in production.

---

### Quick reference — what each surface keys off

| Surface | Shows the guide when… |
|---|---|
| Home `/` | always (lists live + "coming soon") |
| Public landing `/guides/<city>` | `status: "live"` |
| In-app `/guides/<city>/app/*` | `status: "live"` + section has Notion/MDX content |
| Member dashboard `/my` | `status: "live"` **and** member owns it (lifetime ⇒ all) |
| Section content | section has a `notionPageId` (else MDX fallback) |
