# Rich cards from links (for editors)

In any guide section, certain links turn into nice native cards
automatically. You don't do anything special — just **paste the link as
the first thing in a bullet point**, optionally followed by a note.

| Paste this kind of link | You get |
|---|---|
| Google Maps place | A venue card — photo, ★ Google rating, address, Directions button. **New venues show as a plain "Open in Google Maps" card until the place snapshot is refreshed** (see below). |
| **Airbnb** listing (`airbnb.com/rooms/…`) | An accommodation card — photo, listing name, ★ rating, beds/baths, "View on Airbnb" |
| **GetYourGuide** activity (`getyourguide.com/…`) | A native activity card — photo, ★ rating + reviews, duration, price, "Book on GetYourGuide" — with your affiliate ID attached. Consecutive activities lay out two-per-row. |

### How to write the bullet

```
• [paste the link here] — your short note about why you recommend it
```

- The **link goes first**. Whatever you type after it stays in Notion, but
  cards that have a photo don't show it (one photo, name, rating, address
  and buttons is enough - Valeria, 2026-10-10). It only shows on plain link
  cards, e.g. a Google venue that isn't in the snapshot yet.
- The card's title/photo/rating come from the listing itself, so you don't
  need to retype them. The link text can be anything (the place name is fine).
- For Google Maps venues, make the link **bold** and add `(our pick)` in the
  note to flag a favourite.

That's it. Save in Notion, and the live site shows the card within ~60s.

### New Google Maps venues: the photo + stars routine

The site never calls Google live (it ran up a ~£178 bill). Each venue's
photo, stars, rating count and address are fetched **once** into
`data/places.json` + `public/places/`. New venues show as a plain "Open in
Google Maps" card until this routine is run. Venues already done are never
fetched (or charged) again; deleting a venue in Notion costs nothing.

**Step by step** (Arni or Valeria, or their Claude session):

1. Add the venues in Notion as usual (bold Google Maps link first).
2. `git pull` - always, so you have this month's counter.
3. Dry run (free, no Google): 
   `npx tsx scripts/places-snapshot.ts --city <slug> --photos 3`
   It prints how many new venues, this month's usage and the cost. It
   must say **"Estimated cost: £0"** - if it says "Stopping", wait for
   next month or ask Arni.
4. Switch **Places API (New)** ON: Google Cloud → project **StepForward**
   → Google Maps Platform → APIs & Services → Places API (New) → Enable.
5. Run it: same command + `--commit`.
6. Switch Places API (New) **OFF** again (same page → Disable). Check it
   shows "Enable".
7. Pick a photo without people: the run saved up to 3 candidates per
   venue (`public/places/<placeId>-1/2/3.webp`). Look at them and record
   the people-free one in `data/place-photo-picks.json` (place id → 0, 1
   or 2). Default is the first.
8. Commit `data/places.json`, `data/places-usage.json`,
   `data/place-photo-picks.json` and `public/places/` → PR → merge.

**What it fetches per new venue:** 1 Google lookup (stars, rating count,
address) + up to 3 photo downloads. Google gives 1,000 of each **free per
month**; a ~120-venue guide uses ~120 lookups + ~360 photos.

**The counter** (`data/places-usage.json`) tallies every paid-type call
before it's made and **stops the run at 900 of the free 1,000** each month
- so it can't go over, even across several runs. Only `--spend-up-to <£>`
lets it go past 1,000, and **only with Arni's explicit OK**. It's shared
through git, so: one person runs it at a time, `--commit` refuses unless
you're up to date with GitHub, and you commit the counter straight after.

Other options: `--ratings` tops up stars/address for venues that have a
photo but no stars; `--photos-only` skips stars/address (fully free
lookups); `--photos 1` downloads a single photo. Photos copied from
venues' own websites or social media need the venue's permission - don't
scrape them; a CC-licensed photo with credit is fine.

---

**Behind the scenes (for devs):** detection + routing in
`components/NotionRenderer.tsx`. Google → `lib/places.ts` (reads the
snapshot only, no network) + `PlaceCard`.
Airbnb → `lib/embeds.ts` (Open Graph) + `EmbedCard`. GetYourGuide → also
`EmbedCard`, but the data is fetched server-side from GYG's
`activities.frame` widget endpoint (the public page is 403; the frame
returns title/photo/stars/reviews/price by tour id + partner id, no auth).
Tour id + partner id come from the link via `parseGetYourGuide()`; partner
id falls back to `GETYOURGUIDE_PARTNER_ID`. Consecutive embed bullets are
grouped into a 2-col grid in `NotionRenderer`. See
[CONNECTIONS.md](CONNECTIONS.md).
