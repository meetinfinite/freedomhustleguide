# Freedom Hustle app (iOS + Android)

The app lives in `mobile/` - one Expo (React Native) codebase that builds
both the iOS and Android apps. Content is **still managed exactly as
before**: edit a guide in Notion and it shows up in the app within ~60s.
No app update needed for content.

## How it fits together

```
Notion ──► website (Next.js on Vercel) ──► /api/app/* JSON ──► the app
                      ▲                                           │
                      └──────── Supabase (same accounts) ◄────────┘
```

- **The app never talks to Notion directly.** It calls the website's
  `/api/app/*` routes, which reuse the same Notion fetch + `data/places.json`
  venue snapshot as the website (still no live Google calls).
- **Accounts:** same Supabase project as the website. Sign-up in the app is
  first name + email → a 6-digit code by email. A web buyer can sign in
  to the app with the email they bought with.
- **Access:** every signed-in app user gets every live guide, free.
  `status: "soon"` guides show as "Coming soon" cards.
- **Rendering:** `mobile/src/components/NotionBlocks.tsx` is the native
  version of `components/NotionRenderer.tsx`, with the same Notion
  conventions (checklists, `PRO TIP -` callouts, Maps / Airbnb / GYG cards).
  **If you change a convention in one, change it in the other.**

| Route | What |
|---|---|
| `GET /api/app/guides` | Guide library (public) - registry from `lib/guides.ts` |
| `GET /api/app/guides/:slug/:section` | One section's Notion blocks (needs sign-in) |
| `POST /api/app/me` | After sign-in: creates a `members` row if missing + Slack ping |
| `DELETE /api/app/me` | In-app "Delete account" (App Store requirement) |

## Adding a guide or section

Nothing app-specific. Follow `docs/GUIDE_ROLLOUT.md`. Once the website
deploys with the guide set to `live`, it appears in the app.

## Web → app

`lib/appLinks.ts`: when `NEXT_PUBLIC_IOS_APP_URL` and/or
`NEXT_PUBLIC_ANDROID_APP_URL` are set (Vercel + `.env.local`), live guide
pages swap pay-what-you-want for **Download the app** buttons. Leave them
unset until the app is approved in the stores. People who already own a guide
keep reading it on the web.

## One-time setup before the app can sign people in

The sign-in email must contain the code. In **Supabase → Authentication →
Email Templates**, paste `docs/magic-link-email.html` into **Magic Link**
*and* **Confirm signup**. It now contains `{{ .Token }}` (the app's code)
as well as the web link, so it works for both.

## Run it locally

```bash
npm run dev                      # website/API on :3000
cd mobile && npx expo run:ios    # or run:android - builds + opens the simulator
```

**Gotcha:** local iOS builds fail when the project path contains spaces
("Claude Code/Travel Guide") - an Expo build script splits on the space.
Build from a copy at a space-free path (or rely on EAS cloud builds, which
aren't affected).

`mobile/.env.local` (gitignored, see `.env.example`) points the app at
`http://localhost:3000`. Delete `EXPO_PUBLIC_API_URL` to use the live site.
Typecheck: `cd mobile && npx tsc --noEmit`.

## Shipping to the stores

Builds run on Expo's EAS cloud (`mobile/eas.json`, free tier is enough). You
need, one-off:

- An **Expo account** (free) - `npx eas-cli@latest login`
- **Apple Developer Program** - $99/year - for the App Store
- **Google Play Console** - $25 one-off - for Google Play

Then:

```bash
cd mobile
npx eas-cli@latest build --platform all --profile production
npx eas-cli@latest submit --platform ios      # → App Store Connect / TestFlight
npx eas-cli@latest submit --platform android  # → Play Console
```

Store review needs: screenshots, description, the privacy policy URL
(`/privacy`), a support email, and a **review login**. The App Store
reviewer can't receive our email codes, so create a demo account and give
Apple a way in (e.g. a fixed test code for one demo email via Supabase's
test OTP setting) in the review notes.

The bundle ID / package is `com.freedomhustleguide.app` (`mobile/app.json`).
App code changes need a new store build; guide content never does.
