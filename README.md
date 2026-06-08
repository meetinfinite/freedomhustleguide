# Freedom Hustle — Digital Nomad Guides

A small, premium-feeling product website for paid digital nomad city guides.

**Bangkok** is the first (and currently only *live*) guide. The architecture is
built so you can add Ubud, Chiang Mai, Koh Samui, Kuala Lumpur and more by
adding metadata in `lib/guides.ts` and authoring the content in Notion — no
template-rewriting needed.

---

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — premium black / off-white / warm sand / electric blue palette
- **Notion** is the source of truth for guide content, fetched via the official
  `@notionhq/client` and rendered block-by-block to React. Each section can fall
  back to an **MDX** file when no Notion page is configured (or Notion is down).
- **Supabase** — magic-link auth + a `members` table that records who bought what
- **Stripe** — Checkout for single-guide and lifetime purchases; a webhook grants
  access on `checkout.session.completed`
- **Resend** — delivers the magic-link email, configured as Supabase Auth's
  custom SMTP provider (not called directly from app code)
- **Google Places** — enriches venue cards (optional)
- **Vercel** auto-deploys the `main` branch on every push

---

## Run it locally

```bash
npm install
cp .env.example .env.local        # fill in the keys you need (see below)
npm run dev                        # next dev on http://localhost:3000
```

The app degrades gracefully when keys are missing:

- **No `NOTION_TOKEN`** → sections render from their MDX fallback files.
- **No Stripe / Supabase keys** → the marketing pages and content render; only
  checkout and sign-in are unavailable.

Routes you can hit:

- `/` — home (lists all guides)
- `/guides/bangkok` — public landing page (hero, what's inside, FAQ, CTA)
- `/guides/bangkok/access` — buy / sign-in gate
- `/signin` — magic-link sign-in for existing buyers
- `/my` — signed-in member dashboard
- `/guides/bangkok/app` — protected guide overview
- `/guides/bangkok/app/<section>` — a section page (14 section slugs)

---

## Content

### Source of truth: Notion → falls back to MDX

The section list is defined in [`lib/guides.ts`](lib/guides.ts) (`SECTION_TEMPLATE`
plus per-city overrides). For each section, the renderer route
([`app/guides/[slug]/app/[section]/page.tsx`](app/guides/[slug]/app/[section]/page.tsx))
resolves the body in this order:

1. **Notion** — if the section's override sets a `notionPageId`, the page is
   fetched via [`lib/notion.ts`](lib/notion.ts) and rendered by
   [`components/NotionRenderer.tsx`](components/NotionRenderer.tsx). Cached with
   `revalidate = 60`.
2. **MDX fallback** — otherwise (or if the Notion fetch fails) it reads
   `content/guides/<slug>/<section>.mdx` via [`lib/mdx.ts`](lib/mdx.ts) and
   renders it with [`components/MdxRenderer.tsx`](components/MdxRenderer.tsx).

The Bangkok `notionPageId`s live in `BANGKOK_SECTION_OVERRIDES` in `lib/guides.ts`.
To repoint a section at a different Notion page, change its ID there. To capture a
page's ID, run `scripts/notion-probe.mjs` (needs `NOTION_TOKEN` + the integration
shared with the page).

> The Notion integration must be connected to the "Bangkok — The Freedom Hustle
> Guide" parent page: in Notion, open the page → `•••` → **Connections** → add the
> integration.

### Notion authoring conventions

`NotionRenderer` maps plain Notion blocks to rich components by convention:

| In Notion | Renders as |
|---|---|
| First paragraph fully *italic* | The section's intro/description (lifted out of the body) |
| Consecutive `to-do` checkboxes | An interactive `<Checklist>` (progress saved in localStorage) |
| Quote starting `DON'T —` / `AVOID —` | `<WarningCard severity="warn">` |
| Quote starting `DANGER —` / `NEVER —` | `<WarningCard severity="danger">` |
| Quote starting `PRO TIP —` | `<ProTip>` |
| Quote starting `GOOD TO KNOW —` | `<ProTip label="Good to know">` |
| Bullet whose **bold** lead text links to a Google Maps URL | A `<PlaceCard>` (place data prefetched server-side) |
| Headings / paragraphs / lists / tables / images / dividers | Plain HTML equivalents |

### MDX components (for fallback files)

When a section renders from MDX, these components are available (wired in
[`components/MdxRenderer.tsx`](components/MdxRenderer.tsx)):

| Component | Use it for |
|---|---|
| `<AreaCard />` | Neighborhood comparison (vibe, rent, pros/cons, score) |
| `<BudgetCard />` | Budget tier (Budget / Comfortable / Premium) |
| `<BudgetCalculator />` | Interactive monthly budget sliders |
| `<CafeCard />` | Cafés with WiFi/plug/noise/call ratings |
| `<CoworkingCard />` | Coworking spaces with day-pass + pros/cons |
| `<GymCard />` | Gyms / Muay Thai / yoga / wellness |
| `<Checklist />` | Interactive checklist (saves progress in localStorage) |
| `<WarningCard severity="warn\|danger\|info" />` | Highlighted callout |
| `<ResourceCard />` | External link with category |
| `<TripCard />` | Weekend trip with verdict (Yes / Maybe / Skip) |
| `<ProTip />` | A blue-highlighted tip block |
| `<PlaceCard url="..." />` | Google Maps URL → auto-fills name, photo, rating, address (needs `GOOGLE_PLACES_API_KEY`; degrades to a link card without it) |

### Section / fallback-file reference

The Bangkok guide has **13 sections**, all reading from Notion:

```
content/guides/bangkok/
  first-24-hours.mdx
  areas-to-stay.mdx
  monthly-budget.mdx
  cafes.mdx
  coworking.mdx
  restaurants.mdx
  nightlife.mdx
  gyms.mdx
  getting-around.mdx
  trips-and-activities.mdx
  mistakes-to-avoid.mdx
  digital-nomad-toolkit.mdx
```

> (WiFi / SIM / Apps was merged into Digital Nomad Toolkit and removed as a
> standalone section.)

> `visa-immigration` (section #9) renders from Notion **only** — it has no MDX
> fallback file, so if Notion is unavailable that section 404s. Export its Notion
> content to `content/guides/bangkok/visa-immigration.mdx` if you want it covered.

---

## Access & payments

There's no homegrown auth — it's Supabase magic-link sessions plus a `members`
table, with Stripe driving who gets access.

**Buying** (`app/api/checkout/route.ts`): the client POSTs a `product`
(`"bangkok"` for the single guide, or `"lifetime"`). The route creates a Stripe
Checkout session for the matching Price ID, with `allow_promotion_codes: true`
(that's how the `FREEDOM` coupon applies). Purchase metadata (`product`,
`guide_slug`) rides along on the session.

**Granting access** (`app/api/webhooks/stripe/route.ts`): on
`checkout.session.completed`, the webhook verifies the signature and calls
`grantPurchase()` ([`lib/members.ts`](lib/members.ts)) to upsert the buyer into the
`members` table — `lifetime = true` for lifetime, or appending the slug to
`guides[]` for a single guide. For **new** buyers it also sends a Supabase
magic-link so they can sign in the first time.

**Signing in** (`app/api/auth/signin/route.ts`): existing members request a magic
link, which only sends if their email is already in `members` (blocks random
sign-up spam). The link lands on `/auth/callback`, which sets the session cookie.

**Checking access**: `hasGuideAccess(email, slug)` in `lib/members.ts` — lifetime
members get everything; single-guide buyers get their slug. `middleware.ts`
refreshes the Supabase session on every request.

### Supabase `members` table

```sql
create table members (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  lifetime boolean default false,
  guides text[] default '{}',
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

The service-role key bypasses RLS and is **server-side only** (`lib/members.ts`,
`lib/supabase/admin.ts`). The anon key + URL are used by the SSR client in
`middleware.ts`.

### Stripe local testing

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# use the printed whsec_... as STRIPE_WEBHOOK_SECRET
```

Stripe is in **test mode**. The `FREEDOM` promotion code discounts the £299
lifetime price to £79 in test mode.

---

## Environment variables

See [`.env.example`](.env.example) for the full, annotated list. Summary:

| Var | Purpose | Read in |
|---|---|---|
| `NOTION_TOKEN` | Fetch guide content | `lib/notion.ts` |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | SSR auth client | `middleware.ts`, `lib/supabase/*` |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin DB access (server only) | `lib/members.ts`, webhooks |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Checkout + webhook | `lib/stripe.ts`, `app/api/*` |
| `STRIPE_PRICE_BANGKOK` / `STRIPE_PRICE_LIFETIME` | Product Price IDs | `lib/guides.ts`, `lib/stripe.ts` |
| `GOOGLE_PLACES_API_KEY` | Enrich `<PlaceCard>` venues | `lib/places.ts` |

> **Local vs. cloud:** `.env.local` is gitignored and lives only on the machine
> that created it. For Vercel and for Claude Code on the web sessions, set the
> same variables in that platform's environment-variable config so every build /
> container gets them. Transactional email (the magic link) is sent by Supabase
> Auth's SMTP — configure Resend as the custom SMTP provider in the Supabase
> dashboard; there is no `RESEND_API_KEY` in this app.

---

## Adding a new guide

1. In `lib/guides.ts`: add (or flip `status: "soon"` → `"live"` on) the guide
   metadata, and set its `stripePriceId` via a `STRIPE_PRICE_<SLUG>` env var.
2. Author the section content in Notion and set each section's `notionPageId` in
   that city's overrides — or drop MDX files into `content/guides/<slug>/`.
3. Create the matching Stripe Price (test + live).

Both the landing page (`/guides/<slug>`), the access gate, and the protected app
(`/guides/<slug>/app/<section>`) work off the same metadata.

---

## Project structure

```
app/
  layout.tsx                         # Global layout + fonts
  page.tsx                           # Home (lists guides)
  signin/page.tsx                    # Magic-link sign-in
  my/page.tsx                        # Signed-in member dashboard
  auth/callback/page.tsx             # Magic-link landing → sets session
  api/
    checkout/route.ts                # Create Stripe Checkout session
    webhooks/stripe/route.ts         # Grant access on payment
    auth/signin/route.ts             # Send magic link to members
    place/ , place-photo/ , notify/  # Places enrichment + notify
  guides/[slug]/
    page.tsx                         # Public landing page
    access/page.tsx                  # Buy / sign-in gate
    app/
      layout.tsx                     # Protected shell (sidebar + access check)
      page.tsx                       # Guide overview (section cards + map)
      [section]/page.tsx             # Section page (Notion → MDX fallback)
components/
  NotionRenderer.tsx                 # Notion blocks → React
  MdxRenderer.tsx                    # MDX → React (fallback)
  GuideAppShell.tsx , GuideDashboard.tsx , LockedAccess.tsx , SignInForm.tsx
  PlaceCard.tsx , Checklist.tsx , WarningCard.tsx , ProTip.tsx ... (and more)
lib/
  guides.ts                          # Guide metadata + section registry + overrides
  notion.ts                          # Notion fetch + place prefetch + italic rule
  mdx.ts                             # MDX file loader (gray-matter)
  members.ts                         # members table: lookup / access / grant
  stripe.ts                          # Stripe client + Price IDs
  places.ts                          # Google Places lookup + cache
  supabase/                          # admin / server / client SSR helpers
content/guides/bangkok/*.mdx         # Per-section MDX fallbacks
scripts/                             # notion-probe, lookup-places, admin-signin, ...
```

---

## Design notes

- **Mobile-first.** Every component works at 360px wide. Desktop adds the
  sticky sidebar but nothing else.
- **Palette.** Premium black (`ink-900`), off-white background (`sand-50`),
  warm sand accents (`sand-100`–`500`), electric blue accent (`electric-500`).
- **Typography.** Fraunces (display) + Inter (body). Tight letter-spacing,
  generous line height in body copy.
- **Motion.** A subtle fade-up on hero load; hover lift on cards. Nothing
  flashy — Apple/Linear/Arc territory.
- **Cards everywhere.** Rounded `2xl`/`3xl`, soft shadows, off-white surfaces.

---

## What's deliberately *not* here

- **No auth library** (NextAuth, Clerk). Supabase magic-link sessions only.
- **No passwords.** Sign-in is email magic-link; access is gated by the
  `members` table.
- **No tests / CI yet.** Add Playwright + a GitHub Actions workflow once the
  routes settle.
- **No analytics.** Plug in Plausible or PostHog when launching.
