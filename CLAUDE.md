# Freedom Hustle Guide — project context

Premium digital-nomad city guides. Next.js 14 (App Router) + TypeScript +
Tailwind, deployed on Vercel. Guide **content** lives in **Notion**; the
site **structure** lives in this repo.

## How content vs code split

- **Guide content** (the sections inside each city guide) = **Notion**,
  read via the `NOTION_TOKEN` integration "Freedom Hustle Site". Editing in
  Notion is live within ~60s — no deploy. See `docs/NOTION_CARDS.md` for how
  pasted links (Google Maps / Airbnb / GetYourGuide) auto-render as cards.
- **Structure / app code** = this repo. A code change is live only after it
  merges to `main` and Vercel deploys. There is **no other way** to change
  the live site's code.

## Workflow — branches & PRs (don't push to `main`)

Production deploys straight from `main`, so we don't commit to it directly:

1. Branch off `main`: `git checkout -b your-change`.
2. Commit + push the branch.
3. Open a PR (`gh pr create`). **Vercel posts a preview URL on the PR** —
   open it to see your change running before it's live.
4. Review the preview, then merge the PR → Vercel deploys to production.

This is the "staging": every PR gets its own throwaway preview site.

## Key docs

- `docs/GUIDE_ROLLOUT.md` — step-by-step to launch a new city guide.
- `docs/CONNECTIONS.md` — every external service + which env var drives it.
- `docs/NOTION_CARDS.md` — how links become cards (editor guide).

## Commands

- `npm run dev` — local dev server (http://localhost:3000).
- `npx tsc --noEmit` — typecheck (run before every PR).

## Map

- `lib/guides.ts` — the guide registry (cities, sections, Notion page IDs,
  `status: "soon" | "live"`). The single source of structure.
- `lib/notion.ts` — fetches + shapes Notion pages. `lib/embeds.ts`,
  `lib/places.ts` — link-card data. `lib/members.ts` — Supabase auth/access.
- `components/NotionRenderer.tsx` — turns Notion blocks into React.
- `app/page.tsx` — homepage. `app/guides/[slug]/...` — landing + gated app.

## Golden rules

0. **Never invent social proof.** No testimonials, review counts, star
   ratings, customer numbers or "was" prices unless they are real and
   evidenced. Fabricated ones breach Meta's Community Standards (Fraud,
   scams and deceptive practices) and UK consumer law (DMCC Act 2024) —
   invented testimonials on the homepage got the site's Instagram link
   blocked for a month in Aug 2026. A struck-through price must be one we
   genuinely charged. If asked for social proof and there's none yet, say
   so and write something true instead.
1. Content → Notion. Structure → code → PR → merge → deploy.
2. Any new env var goes in **both** `.env.local` and Vercel.
3. Only register a guide section that has Notion (or MDX) content, or it
   404s on the dashboard.
