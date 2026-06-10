import { Client } from "@notionhq/client";
import { getPlaceFromUrl, type PlaceData } from "./places";
import {
  getEmbedFromUrl,
  embedKindForUrl,
  type EmbedData
} from "./embeds";

/** URL pattern: links the team uses for venue place lookups. */
const GMAPS_HOST_RE =
  /^https?:\/\/(www\.)?(google\.[^/]+\/maps|maps\.google\.[^/]+|maps\.app\.goo\.gl|goo\.gl\/maps)/i;

let cachedClient: Client | null = null;

/** Lazy-singleton — instantiated on first use, on the server only. */
function getClient(): Client {
  if (!cachedClient) {
    const token = process.env.NOTION_TOKEN;
    if (!token) {
      throw new Error(
        "NOTION_TOKEN is not set. Add it to .env.local and Vercel."
      );
    }
    cachedClient = new Client({ auth: token });
  }
  return cachedClient;
}

// ---------------------------------------------------------------------------
// Types — simplified shape we care about. Notion's full types are huge.
// ---------------------------------------------------------------------------

export interface NotionBlock {
  id: string;
  type: string;
  /**
   * Raw block payload from Notion (the type-specific data field).
   * The renderer reads the shape that matches `type`.
   */
  data: unknown;
  /** True if the block has nested children (we currently don't recurse). */
  hasChildren: boolean;
  /** Pre-fetched children — populated for tables (rows live as children). */
  children?: NotionBlock[];
}

export interface NotionPage {
  id: string;
  title: string;
  /**
   * Optional one-line description — pulled from the first paragraph
   * block on the page when every segment of its rich text is italic.
   * That's the team's convention: italicise the lead sentence and it
   * becomes the page subtitle.
   */
  description?: string;
  blocks: NotionBlock[];
  /**
   * Place data pre-resolved at fetch time for every venue bullet's
   * Google Maps URL. The PlaceCard component renders straight from
   * this map instead of doing its own client-side /api/place fetch,
   * which collapses 18+ Cafés-page round-trips into one server-side
   * batch that's cached for the section's revalidate window.
   */
  places: Record<string, PlaceData>;
  /**
   * Same idea as `places`, but for Airbnb / GetYourGuide bullets — keyed
   * by the link URL. EmbedCard renders straight from this map.
   */
  embeds: Record<string, EmbedData>;
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

/**
 * Fetch a Notion page's title and the full list of top-level blocks.
 * Paginated automatically. Cached per render thanks to React's `cache`
 * behaviour (each request gets a fresh fetch).
 *
 * The Next.js route should configure `revalidate` to control how often
 * the underlying data is re-read across requests.
 */
export async function fetchSectionPage(pageId: string): Promise<NotionPage | null> {
  const notion = getClient();

  // Page metadata (title)
  let page;
  try {
    page = await notion.pages.retrieve({ page_id: pageId });
  } catch (err) {
    console.error(`[notion] retrieve(${pageId}) failed:`, err);
    return null;
  }

  // page is either PageObjectResponse or PartialPageObjectResponse.
  // Title lives in whichever property has type === "title".
  let title = "Untitled";
  if ("properties" in page) {
    for (const prop of Object.values(page.properties)) {
      if (prop && (prop as { type?: string }).type === "title") {
        const richText = (prop as { title?: Array<{ plain_text?: string }> })
          .title;
        if (richText?.[0]?.plain_text) {
          title = richText.map((r) => r.plain_text ?? "").join("");
        }
        break;
      }
    }
  }

  // Walk pagination to collect every top-level block
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;
  do {
    let res;
    try {
      res = await notion.blocks.children.list({
        block_id: pageId,
        start_cursor: cursor,
        page_size: 100
      });
    } catch (err) {
      console.error(`[notion] blocks.children.list(${pageId}) failed:`, err);
      break;
    }
    for (const block of res.results) {
      if (!("type" in block)) continue;
      const type = block.type;
      blocks.push({
        id: block.id,
        type,
        // The block's payload lives under a key matching its type
        // (e.g. block.paragraph, block.to_do, block.quote, etc.)
        data: (block as unknown as Record<string, unknown>)[type],
        hasChildren: Boolean(block.has_children)
      });
    }
    cursor = res.has_more ? res.next_cursor || undefined : undefined;
  } while (cursor);

  // Convention: if the first block is a paragraph whose every
  // non-empty rich-text segment is italic, treat it as the page
  // description and remove it from the body.
  let description: string | undefined;
  const first = blocks[0];
  if (first?.type === "paragraph") {
    const rt =
      (first.data as { rich_text?: { plain_text?: string; annotations?: { italic?: boolean } }[] })
        ?.rich_text || [];
    const segments = rt.filter((r) => (r.plain_text || "").trim().length > 0);
    if (
      segments.length > 0 &&
      segments.every((r) => Boolean(r.annotations?.italic))
    ) {
      description = rt
        .map((r) => r.plain_text || "")
        .join("")
        .trim();
      // Drop the description block from the body so it isn't rendered twice
      blocks.shift();
    }
  }

  // For block types whose meaningful content lives in their children
  // (tables → rows, etc.), fetch one level deep so the renderer has
  // everything it needs without doing a second pass.
  await Promise.all(
    blocks
      .filter((b) => b.hasChildren && b.type === "table")
      .map(async (b) => {
        try {
          const res = await notion.blocks.children.list({
            block_id: b.id,
            page_size: 100
          });
          b.children = res.results
            .filter((r): r is typeof r & { type: string } => "type" in r)
            .map((r) => ({
              id: r.id,
              type: r.type,
              data: (r as unknown as Record<string, unknown>)[r.type],
              hasChildren: Boolean((r as { has_children?: boolean }).has_children)
            }));
        } catch (err) {
          console.warn(`[notion] children fetch failed for ${b.id}:`, err);
        }
      })
  );

  // Prefetch place + embed data for every venue / accommodation / activity
  // bullet in parallel, so the client renders straight from these maps.
  const [places, embeds] = await Promise.all([
    prefetchVenuePlaces(blocks),
    prefetchEmbeds(blocks)
  ]);

  return { id: pageId, title, description, blocks, places, embeds };
}

/** Walk the blocks, find Airbnb / GetYourGuide bullets (a link to one of
 *  those hosts), resolve each to EmbedData. Returns a URL → embed map. */
async function prefetchEmbeds(
  blocks: NotionBlock[]
): Promise<Record<string, EmbedData>> {
  // Collect distinct embed URLs + the editor's link text (title fallback).
  const found = new Map<string, string>(); // url → link text
  for (const b of blocks) {
    if (b.type !== "bulleted_list_item") continue;
    const rt = (
      b.data as {
        rich_text?: { plain_text?: string; href?: string | null }[];
      }
    )?.rich_text;
    const first = rt?.[0];
    if (!first?.href || !embedKindForUrl(first.href)) continue;
    if (!found.has(first.href)) {
      found.set(first.href, (first.plain_text || "").trim());
    }
  }
  if (found.size === 0) return {};

  const out: Record<string, EmbedData> = {};
  const queue = Array.from(found.entries());
  const concurrency = Math.min(5, queue.length);
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (queue.length) {
        const next = queue.shift();
        if (!next) return;
        const [url, fallbackTitle] = next;
        try {
          const data = await getEmbedFromUrl(url, { fallbackTitle });
          if (data) out[url] = data;
        } catch (err) {
          console.warn(`[notion] embed prefetch failed for ${url}:`, err);
        }
      }
    })
  );
  return out;
}

/** Walk the blocks, find venue-style bullets (bold + linked text whose
 *  href looks like a Google Maps URL), resolve each href to PlaceData
 *  via the existing places client. Returns a URL → place map. */
async function prefetchVenuePlaces(
  blocks: NotionBlock[]
): Promise<Record<string, PlaceData>> {
  // Collect distinct venue URLs from the page
  const urls: string[] = [];
  for (const b of blocks) {
    if (b.type !== "bulleted_list_item") continue;
    const rt = (
      b.data as {
        rich_text?: {
          plain_text?: string;
          href?: string | null;
          annotations?: { bold?: boolean };
        }[];
      }
    )?.rich_text;
    const first = rt?.[0];
    if (!first || !first.annotations?.bold) continue;
    if (!first.href || !GMAPS_HOST_RE.test(first.href)) continue;
    if (!urls.includes(first.href)) urls.push(first.href);
  }
  if (urls.length === 0) return {};

  const out: Record<string, PlaceData> = {};
  const queue = urls.slice();
  const concurrency = Math.min(5, queue.length);
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (queue.length) {
        const url = queue.shift();
        if (!url) return;
        try {
          const data = await getPlaceFromUrl(url);
          if (data) out[url] = data;
        } catch (err) {
          console.warn(`[notion] place prefetch failed for ${url}:`, err);
        }
      }
    })
  );
  return out;
}
