import type { NextRequest } from "next/server";
import { unstable_cache } from "next/cache";
import { getSupabaseAdmin } from "./supabase/admin";
import { fetchSectionPage, type NotionPage } from "./notion";
import type { GuideMeta } from "./guides";

/**
 * Shared helpers for the mobile app's JSON API (app/api/app/*).
 *
 * The app (mobile/) never talks to Notion or Supabase's database directly -
 * it calls these routes, which reuse the exact same Notion fetch + venue
 * snapshot as the website. So content is still edited in Notion and shows
 * up in the app within ~60s, no app release needed.
 *
 * Auth: the app signs in with Supabase (email code) and sends the session's
 * access token as `Authorization: Bearer <token>`.
 */

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
}

/** Resolve the signed-in app user from the Bearer token, or null. */
export async function getAppUser(req: NextRequest): Promise<AppUser | null> {
  const header = req.headers.get("authorization") || "";
  const token = header.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;
  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !data.user?.email) return null;
  const meta = (data.user.user_metadata || {}) as { name?: unknown };
  return {
    id: data.user.id,
    email: data.user.email.toLowerCase(),
    name: typeof meta.name === "string" && meta.name.trim() ? meta.name.trim() : null
  };
}

/** Public origin of this deployment - used to absolutise /uploads paths. */
export function siteOrigin(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("host") || "freedomhustleguide.com";
  return `${proto}://${host}`;
}

/** The app can't resolve site-relative paths, so make every URL absolute. */
export function absolutize(url: string | undefined, origin: string): string | undefined {
  if (!url) return url;
  return url.startsWith("/") ? `${origin}${url}` : url;
}

/** What the app needs to draw a guide card + its section list. */
export interface AppGuide {
  slug: string;
  city: string;
  country: string;
  region?: string;
  flag: string;
  tagline: string;
  status: "live" | "soon";
  cardImage: string;
  heroImage: string;
  quickStats: { label: string; value: string }[];
  sections: {
    slug: string;
    title: string;
    description: string;
    icon: string;
    readingTime: string;
  }[];
}

export function toAppGuide(g: GuideMeta, origin: string): AppGuide {
  const card = absolutize(g.cardImage || g.heroImage, origin) || "";
  return {
    slug: g.slug,
    city: g.city,
    country: g.country,
    region: g.region,
    flag: g.flag,
    tagline: g.tagline,
    status: g.status,
    cardImage: card,
    heroImage: absolutize(g.heroImage, origin) || card,
    quickStats: g.quickStats,
    // Only sections with real content - an empty one would be a dead tap
    // (golden rule 3).
    sections: g.sections
      .filter((s) => s.notionPageId)
      .map(({ slug, title, description, icon, readingTime }) => ({
        slug,
        title,
        // Template descriptions say "{city}" - filled in at render time
        // on the web (GuideDashboard), so do the same here.
        description: description.replace("{city}", g.city),
        icon,
        readingTime
      }))
  };
}

/**
 * fetchSectionPage, cached for 60s per Notion page - the same freshness
 * window as the website's section route. Route handlers that read the
 * Authorization header are dynamic, so without this every app open would
 * hit Notion directly.
 */
export const fetchSectionPageCached = (pageId: string): Promise<NotionPage | null> =>
  unstable_cache(() => fetchSectionPage(pageId), ["app-notion-section", pageId], {
    revalidate: 60
  })();
