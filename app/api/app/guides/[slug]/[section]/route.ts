import { NextRequest, NextResponse } from "next/server";
import { getGuide, getSection } from "@/lib/guides";
import { getMember } from "@/lib/members";
import {
  absolutize,
  fetchSectionPageCached,
  getAppUser,
  siteOrigin
} from "@/lib/appApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/app/guides/:slug/:section - one guide section's Notion content,
 * already shaped (blocks + venue/embed card data) for the app's renderer.
 *
 * Access: any signed-in app user gets every live guide (free for now).
 * Soon guides stay founder-preview only (lifetime members), like the web.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string; section: string } }
) {
  const user = await getAppUser(req);
  if (!user) {
    return NextResponse.json({ error: "Sign in to read this guide." }, { status: 401 });
  }

  const guide = getGuide(params.slug);
  const section = getSection(params.slug, params.section);
  if (!guide || !section?.notionPageId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (guide.status !== "live") {
    const member = await getMember(user.email);
    if (!member?.lifetime) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const page = await fetchSectionPageCached(section.notionPageId);
  if (!page) {
    return NextResponse.json(
      { error: "Couldn't load this section. Try again in a minute." },
      { status: 502 }
    );
  }

  // Venue photos are our own copies under /places - absolutise them.
  const origin = siteOrigin(req);
  const places = Object.fromEntries(
    Object.entries(page.places).map(([url, p]) => [
      url,
      { ...p, photos: p.photos.map((ph) => ({ ...ph, src: absolutize(ph.src, origin)! })) }
    ])
  );

  const idx = guide.sections.findIndex((s) => s.slug === section.slug);
  const withContent = (i: number) => {
    const s = guide.sections[i];
    return s?.notionPageId ? { slug: s.slug, title: s.title } : null;
  };

  return NextResponse.json({
    section: {
      slug: section.slug,
      icon: section.icon,
      readingTime: section.readingTime,
      // Notion titles look like "01 · First 24 Hours" - strip the number.
      title: page.title.replace(/^\d+\s*[·.\-]\s*/, "").trim() || section.title,
      description: page.description ?? null
    },
    page: { id: page.id, blocks: page.blocks, places, embeds: page.embeds },
    prev: idx > 0 ? withContent(idx - 1) : null,
    next: idx < guide.sections.length - 1 ? withContent(idx + 1) : null
  });
}
