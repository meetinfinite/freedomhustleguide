# Rich cards from links (for editors)

In any guide section, certain links turn into nice native cards
automatically. You don't do anything special — just **paste the link as
the first thing in a bullet point**, optionally followed by a note.

| Paste this kind of link | You get |
|---|---|
| Google Maps place | A venue card — photo, ★ Google rating, address, Directions button |
| **Airbnb** listing (`airbnb.com/rooms/…`) | An accommodation card — photo, listing name, ★ rating, beds/baths, "View on Airbnb" |
| **GetYourGuide** activity (`getyourguide.com/…`) | GetYourGuide's own native activity card — photo, ★ rating, duration, "Book" button — with your affiliate ID attached |

### How to write the bullet

```
• [paste the link here] — your short note about why you recommend it
```

- The **link goes first**. Whatever you type after a dash (`—`) becomes the
  card's "Good to know" note.
- The card's title/photo/rating come from the listing itself, so you don't
  need to retype them. The link text can be anything (the place name is fine).
- For Google Maps venues, make the link **bold** and add `(our pick)` in the
  note to flag a favourite.

That's it. Save in Notion, and the live site shows the card within ~60s.

---

**Behind the scenes (for devs):** detection + routing in
`components/NotionRenderer.tsx`. Google → `lib/places.ts` + `PlaceCard`.
Airbnb → `lib/embeds.ts` (Open Graph) + `EmbedCard`. GetYourGuide →
`lib/embeds.parseGetYourGuide()` pulls the tour id + partner id straight
from the link and `components/GygWidget.tsx` renders GYG's official
`activities.frame` widget (loader `pa.umd…` script, self-hydrates on
client nav). Partner id comes from the link's `partner_id`, falling back
to `GETYOURGUIDE_PARTNER_ID` — see [CONNECTIONS.md](CONNECTIONS.md).
