import { Client } from "@notionhq/client";

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
}

export interface NotionPage {
  id: string;
  title: string;
  blocks: NotionBlock[];
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

  return { id: pageId, title, blocks };
}
