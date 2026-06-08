# Connections map — what's wired where

The one place that lists every external account / service this project
touches, which credential drives it, and which ones are noise. Start here
instead of reconstructing it each time.

> No secret values live in this file — only the **names** of the env vars.
> Real values are in `.env.local` (local) and Vercel (production).

## The services that matter

| Service | What it does here | Account / location | Env var(s) |
|---|---|---|---|
| **Notion** | Source of truth for all guide content | Integration **"Freedom Hustle Site"** in the **Infinite Studio** workspace | `NOTION_TOKEN` |
| **Vercel** | Hosting + where "live" actually happens | `meetinfinite` project | (all of the below, set in Vercel too) |
| **GitHub** | Code repo | `github.com/meetinfinite/freedomhustleguide` | — |
| **Supabase** | Member accounts, auth, lifetime access (`members` table) | one Supabase project | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Stripe** | Payments — lifetime + per-city | one Stripe account | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_LIFETIME`, `STRIPE_PRICE_<CITY>` |
| **Resend** | Sends sign-in / magic-link emails | Resend account | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` |
| **Google Places** | `<PlaceCard>` venue lookups (name, photo, rating) | Google Cloud project | `GOOGLE_PLACES_API_KEY` |
| **GetYourGuide** (optional) | Affiliate attribution on activity-link cards | partner.getyourguide.com | `GETYOURGUIDE_PARTNER_ID` |

Airbnb / GetYourGuide links pasted into Notion render as native cards (see
[NOTION_CARDS.md](NOTION_CARDS.md)). Airbnb reads the listing page directly
(no key). GetYourGuide is a plain link card until `GETYOURGUIDE_PARTNER_ID`
is set, which adds affiliate tracking — `❌ not set` today.

## Per-city Stripe prices (individual sales)

Each city needs its own Stripe Price ID to be buyable on its own.
Lifetime access does **not** depend on these.

| City | Env var | Set? |
|---|---|---|
| Bangkok | `STRIPE_PRICE_BANGKOK` | ✅ |
| Chiang Mai | `STRIPE_PRICE_CHIANG_MAI` | ❌ **not set** — create a Stripe price + add it (local + Vercel) before selling Chiang Mai standalone |
| (all cities) | `STRIPE_PRICE_LIFETIME` | ✅ |

## Things that look connected but are NOISE (ignore for guide work)

- **The Notion connector wired into the Claude session** → a *different,
  empty workspace*. It returns nothing for Freedom Hustle content. The
  app's `NOTION_TOKEN` integration ("Freedom Hustle Site") is the real one.
- **`NEXT_PUBLIC_TINA_CLIENT_ID` / `TINA_TOKEN`** → leftover from the old
  TinaCMS setup, which was removed from the code. Safe to delete from env.
- **`config/approvedEmails.json` / `lib/access.ts`** → the old MVP email
  gate. Current gating is Supabase members (`lib/members.ts`).

## Golden rules

1. **Production = Vercel.** A code change (incl. flipping a guide to
   `status: "live"`) does nothing for the live site until it's pushed and
   deployed. There is no staging — `main` deploys straight to production.
2. **Guide content = Notion**, connected to the "Freedom Hustle Site"
   integration. See [GUIDE_ROLLOUT.md](GUIDE_ROLLOUT.md).
3. **Any new env var must be added in two places:** `.env.local` *and*
   Vercel. Local-only vars work in dev and silently break in production.
