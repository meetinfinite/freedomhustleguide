# Freedom Hustle — Digital Nomad Guides

A small, premium-feeling product website for paid digital nomad city guides.

**Bangkok** is the first guide. The architecture is built so you can add Ubud,
Chiang Mai, Koh Samui, Kuala Lumpur (and more) by dropping in new MDX files and
metadata — no template-rewriting needed.

---

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with a premium black / off-white / warm sand / electric blue palette
- **MDX** content files (rendered via `next-mdx-remote`)
- **Supabase** (optional) for email-gated access — with a JSON/env-var fallback for MVP
- No CMS, no auth library, no DB required to run locally

---

## Run it locally

```bash
npm install
cp .env.example .env.local        # optional — works fine without
npm run dev                       # starts TinaCMS + Next.js together
```

Open <http://localhost:3000>.

**Edit content visually:** open <http://localhost:3000/admin/index.html> — that's the TinaCMS editor (see [Content management](#content-management) below).

Routes you can hit immediately:

- `/` — root marketing page (lists all guides)
- `/guides/bangkok` — public landing page (hero, what's inside, FAQ, CTA)
- `/guides/bangkok/access` — email gate
- `/guides/bangkok/app` — protected guide dashboard
- `/guides/bangkok/app/areas-to-stay` (or any of the 13 section slugs)

Test the gate with one of the demo emails in `config/approvedEmails.json`:

- `demo@freedomhustle.com`
- `buyer@example.com`

---

## How gating works (MVP)

When someone enters their email on the access page, the client POSTs to
`/api/access`, which runs `verifyAccess()` from [`lib/access.ts`](lib/access.ts).
Resolution order:

1. **`APPROVED_EMAILS` env var** (comma-separated, applies to all guides) — easiest for one-off launches
2. **`config/approvedEmails.json`** (per-guide list) — easiest for MVP
3. **Supabase `purchases` table** (if `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set) — recommended once you have real buyers

On success, the client stores a small token in `localStorage` under
`fh:access:<guideSlug>` and redirects to `/guides/<slug>/app`. The protected app
shell ([`components/GuideAppShell.tsx`](components/GuideAppShell.tsx)) reads
that token on mount and bounces unauthenticated users back to `/access`.

> This is intentionally simple. It's a validation MVP — not a fortress. Anyone
> with the URL and the right email can unlock. Swap to a real session/JWT once
> you bolt on payments.

### Adding buyer emails (MVP)

The fastest way:

```jsonc
// config/approvedEmails.json
{
  "bangkok": [
    "demo@freedomhustle.com",
    "real-buyer-1@example.com",
    "real-buyer-2@example.com"
  ]
}
```

Or via env (`.env.local`):

```bash
APPROVED_EMAILS=demo@freedomhustle.com,real-buyer-1@example.com
```

### Adding Supabase (recommended once you launch)

1. Create a Supabase project.
2. Create a `purchases` table:

```sql
create table purchases (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  guide_slug text not null,
  access_granted boolean default true,
  created_at timestamptz default now()
);
create index on purchases (email, guide_slug);
```

3. Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

The service role key bypasses RLS, so **keep it server-side only** — it's only
read in `lib/access.ts` which runs in the API route runtime.

4. Manually add buyer emails for now:

```sql
insert into purchases (email, guide_slug) values ('buyer@example.com', 'bangkok');
```

### Adding Stripe / Lemon Squeezy webhook (later)

Once you're ready for real payments:

1. Set up a checkout link on Lemon Squeezy / Stripe.
2. Set `NEXT_PUBLIC_CHECKOUT_URL` in `.env.local` so all "Get the guide" buttons point to it.
3. Add a webhook endpoint at `app/api/webhooks/lemon-squeezy/route.ts` (or `stripe`) that:
   - Verifies the webhook signature.
   - On `order_created` / `checkout.session.completed`, inserts the customer email + guide slug into the Supabase `purchases` table.
   - Optionally sends a "your guide is ready" email.

`lib/access.ts` already checks Supabase, so no other changes are needed — once
the buyer's email lands in the table, they can unlock the guide.

---

## Content management

You have two ways to edit content:

### Option 1 — TinaCMS visual editor (recommended for non-devs)

```bash
npm run dev
# then open http://localhost:3000/admin/index.html
```

You'll get a side-by-side editor:

- Left: tree of all guide sections (`Guide Sections → bangkok → <section>`)
- Right: visual form. Text edits inline. Each custom block (AreaCard, CafeCard, Checklist, etc.) shows up as a draggable card with a proper form — no JSX, no curly braces, no quotes.

Click **Save** and Tina writes the change straight back to the `.mdx` file on disk. Next.js hot-reloads, so you see the result on the live site within a second.

### Option 2 — edit the MDX files directly

If you're comfortable with markdown, open any `content/guides/bangkok/*.mdx` in VS Code. Same outcome, faster for bulk edits, but you'll need to write the JSX for custom blocks yourself. See the [components reference](#mdx-components-available) below.

### Going to production with Tina (for non-dev editors)

The local editor writes to your laptop. For a deployed setup where someone else can edit from a browser without git:

1. Sign up at [app.tina.io](https://app.tina.io) (free for solo / small teams).
2. Create a project, connect it to your GitHub repo.
3. Copy the two env vars into `.env.local` *and* Vercel:
   ```bash
   NEXT_PUBLIC_TINA_CLIENT_ID=...
   TINA_TOKEN=...
   ```
4. Redeploy. Now `/admin/index.html` on the live site lets logged-in editors save — Tina commits the change to GitHub, Vercel rebuilds, content is live in ~60s.

No code changes needed — `tina/config.ts` already reads those env vars and falls back to local-only mode if they're missing.

### Files Tina manages

| Path | Editable in Tina? |
|---|---|
| `content/guides/bangkok/*.mdx` | ✅ Yes — section title, description, body, all custom blocks |
| `lib/guides.ts` (guide metadata, sections list, quick stats) | ❌ No — code, edit manually |
| `config/approvedEmails.json` (MVP buyer list) | ❌ No — edit manually or move to Supabase |
| FAQ on landing page (in `app/guides/[slug]/page.tsx`) | ❌ No — could be moved to MDX later if it changes often |

If you want guide metadata (price, hero quick stats, FAQ) editable in Tina too, that's a follow-up: move those from TypeScript into a `content/guides/<slug>/_meta.json` collection and add it to the schema.

---

## Content (file reference)

All guide content lives in `content/guides/<slug>/*.mdx`. The Bangkok guide
has 13 sections:

```
content/guides/bangkok/
  overview.mdx
  areas-to-stay.mdx
  first-24-hours.mdx
  monthly-budget.mdx
  cafes.mdx
  coworking.mdx
  gyms.mdx
  wifi-sim-apps.mdx
  getting-around.mdx
  scooter-reality-check.mdx
  weekend-trips.mdx
  mistakes-to-avoid.mdx
  resource-vault.mdx
```

Each file is plain MDX — write markdown, drop in components, ship.

### MDX components available

Wired up automatically in [`components/MdxRenderer.tsx`](components/MdxRenderer.tsx):

| Component | Use it for |
|---|---|
| `<AreaCard />` | Neighborhood comparison (vibe, rent, pros/cons, score) |
| `<BudgetCard />` | Budget tier (Budget / Comfortable / Premium) |
| `<BudgetCalculator />` | Interactive monthly budget sliders |
| `<CafeCard />` | Cafes with WiFi/plug/noise/call ratings |
| `<CoworkingCard />` | Coworking spaces with day-pass + pros/cons |
| `<GymCard />` | Gyms / Muay Thai / yoga / wellness |
| `<Checklist />` | Interactive checklist (saves progress in localStorage) |
| `<WarningCard severity="warn\|danger\|info" />` | Highlighted callout |
| `<ResourceCard />` | External link with category |
| `<TripCard />` | Weekend trip with verdict (Yes / Maybe / Skip) |
| `<VideoBlock />` | Placeholder for your own video content |
| `<ProTip />` | A blue-highlighted tip block |
| `<MapPlaceholder />` | Faux map (swap for a real embed later) |
| `<PlaceCard url="..." />` | Paste any Google Maps URL → auto-fills name, photo, rating, address (requires `GOOGLE_PLACES_API_KEY`; degrades to a basic link card without it) |

Editing a section is just:

```bash
# Save the file. Next will hot-reload.
nano content/guides/bangkok/cafes.mdx
```

---

## Adding a new guide

1. Add the guide metadata to `lib/guides.ts` (or flip `status` from `"soon"` to `"live"`).
2. Create `content/guides/<new-slug>/` with one MDX file per section in the metadata.
3. Add the buyer emails to `config/approvedEmails.json` (or Supabase).

That's it. Both the landing page (`/guides/<slug>`), the access page, and the
protected app (`/guides/<slug>/app/<section>`) work off the same metadata.

---

## Project structure

```
app/
  layout.tsx                    # Global layout + fonts
  page.tsx                      # Home (lists guides)
  globals.css                   # Tailwind + prose styles
  api/access/route.ts           # POST /api/access — gating endpoint
  guides/[slug]/
    page.tsx                    # Public landing page
    access/page.tsx             # Email gate (client form)
    app/
      layout.tsx                # Protected shell (sidebar + access check)
      page.tsx                  # Dashboard (section cards)
      [section]/page.tsx        # MDX-rendered section page
components/
  AreaCard.tsx                  # ...one file per MDX component
  BudgetCalculator.tsx          # Interactive sliders
  Checklist.tsx                 # Saves progress to localStorage
  GuideAppShell.tsx             # Client-side gate + layout
  GuideDashboard.tsx            # Section grid
  Hero.tsx                      # Landing hero
  LockedAccess.tsx              # Access page form
  MdxRenderer.tsx               # MDX → React with all components wired
  MobileSectionNav.tsx          # Bottom drawer nav on mobile
  SectionNav.tsx                # Sticky desktop sidebar
  ... (and more — CafeCard, CoworkingCard, etc.)
config/
  approvedEmails.json           # MVP fallback access list
content/
  guides/bangkok/*.mdx          # All 13 Bangkok sections
lib/
  access.ts                     # verifyAccess() — env → JSON → Supabase
  clientAccess.ts               # localStorage helpers
  guides.ts                     # Guide metadata + section registry
  mdx.ts                        # MDX file loader (gray-matter)
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
  No corporate grids, no SaaS gradients.

---

## What's deliberately *not* here

Things you might expect that we left out, on purpose:

- **No auth library** (NextAuth, Clerk). Pure email-match MVP.
- **No CMS.** Editing is `git` + a text editor. Add Sanity/Contentlayer later if you want.
- **No SSO / passwords.** Sessions are localStorage-only. Real session security comes with real payments.
- **No tests yet.** Add Playwright once the routes settle.
- **No analytics.** Plug in Plausible or PostHog when launching.
