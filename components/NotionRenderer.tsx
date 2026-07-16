import { Fragment } from "react";
import type { NotionBlock } from "@/lib/notion";
import type { PlaceData } from "@/lib/places";
import { embedKindForUrl, type EmbedData, type EmbedKind } from "@/lib/embeds";
import { WarningCard } from "./WarningCard";
import { ProTip } from "./ProTip";
import { Checklist } from "./Checklist";
import { PlaceCard } from "./PlaceCard";
import { EmbedCard } from "./EmbedCard";

/**
 * Render a Notion page's blocks as React.
 *
 * Convention-driven smart mapping:
 *   - Consecutive `to_do` blocks are grouped into one <Checklist> with
 *     localStorage progress tracking.
 *   - `quote` blocks read their leading text to choose a style:
 *       "DON'T -"        → <WarningCard severity="warn">
 *       "HEADS UP -"     → <WarningCard severity="warn">
 *       "PRO TIP -"      → <ProTip>
 *       "GOOD TO KNOW -" → <ProTip label="Good to know">
 *       anything else    → styled <blockquote>
 *   - paragraphs / headings / lists / images render as plain HTML.
 */

// ---------- Notion rich text → plain string + inline React ----------

interface NotionRichText {
  plain_text?: string;
  href?: string | null;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
  };
}

function richTextToString(rt: NotionRichText[] | undefined): string {
  if (!rt) return "";
  return rt.map((r) => r.plain_text ?? "").join("");
}

function richTextToReact(rt: NotionRichText[] | undefined) {
  if (!rt) return null;
  return rt.map((r, i) => {
    let node: React.ReactNode = r.plain_text ?? "";
    const a = r.annotations || {};
    if (a.code) node = <code key={i}>{node}</code>;
    if (a.bold) node = <strong key={i}>{node}</strong>;
    if (a.italic) node = <em key={i}>{node}</em>;
    if (a.strikethrough) node = <s key={i}>{node}</s>;
    if (a.underline) node = <u key={i}>{node}</u>;
    if (r.href) {
      node = (
        <a key={i} href={r.href} target="_blank" rel="noopener noreferrer">
          {node}
        </a>
      );
    }
    return <Fragment key={i}>{node}</Fragment>;
  });
}

// ---------- Quote → callout mapping ----------

/** Detect a "tagged" quote - one whose text starts with an uppercase tag
 *  followed by an em-dash, hyphen or en-dash (DON'T - …, PRO TIP - …). */
const TAGGED_QUOTE_REGEX = /^([A-Z][A-Z'\s]+?)\s*[—–-]\s*(.*)/s;

function parseQuoteTag(
  rt: NotionRichText[] | undefined
): { tag: string; title: string } | null {
  const text = richTextToString(rt).trim();
  const m = text.match(TAGGED_QUOTE_REGEX);
  if (!m) return null;
  return { tag: m[1].trim().toUpperCase(), title: m[2].trim() };
}

/** Render an untagged quote block as a plain styled blockquote. */
function renderPlainQuote(rt: NotionRichText[] | undefined, key: string) {
  return (
    <blockquote
      key={key}
      className="border-l-4 border-electric-500 pl-4 italic text-ink-700 my-4"
    >
      {richTextToReact(rt)}
    </blockquote>
  );
}

/** Tags that are negative instructions - their lead word must stay in the
 *  card title or it inverts the meaning ("DON'T - Get pulled in by taxi
 *  touts" must read "Don't get pulled in by taxi touts", not "Get pulled
 *  in by taxi touts"). Maps the parsed tag → the word to prepend. */
const NEGATION_PREFIX: Record<string, string> = {
  "DON'T": "Don't",
  DONT: "Don't",
  AVOID: "Avoid",
  NEVER: "Never"
};

/** Build the callout title, re-attaching the negation word for DON'T-style
 *  tags. Lowercases the first letter of the body so it flows ("Don't get
 *  …"), but leaves acronyms / all-caps starts intact ("Don't ATM …"). */
function calloutTitle(tag: string, title: string): string {
  const lead = NEGATION_PREFIX[tag];
  if (!lead) return title;
  if (!title) return lead;
  const firstWord = title.split(/\s+/)[0] || "";
  const body = /^[A-Z]{2,}/.test(firstWord)
    ? title
    : title.charAt(0).toLowerCase() + title.slice(1);
  return `${lead} ${body}`;
}

/** Render a tagged quote (DON'T / PRO TIP / GOOD TO KNOW / DANGER) with
 *  optional body blocks (consecutive untagged quotes that immediately
 *  follow it - that's the team's authoring convention in Notion). */
function renderTaggedCallout(
  tag: string,
  title: string,
  bodyBlocks: NotionBlock[],
  key: string
) {
  const body = bodyBlocks.length ? (
    <>
      {bodyBlocks.map((qb, idx) => (
        <p key={idx}>{richTextToReact(blockText(qb))}</p>
      ))}
    </>
  ) : null;

  if (
    tag.startsWith("DON'T") ||
    tag.startsWith("HEADS UP") ||
    tag === "AVOID" ||
    tag === "WARNING" ||
    tag === "CAUTION"
  ) {
    return (
      <WarningCard key={key} title={calloutTitle(tag, title)} severity="warn">
        {body}
      </WarningCard>
    );
  }
  if (tag.startsWith("DANGER") || tag === "NEVER") {
    return (
      <WarningCard
        key={key}
        title={calloutTitle(tag, title)}
        severity="danger"
      >
        {body}
      </WarningCard>
    );
  }
  if (tag.startsWith("PRO TIP")) {
    return (
      <ProTip key={key} label="Pro tip">
        {title ? <p className="!font-semibold text-ink-900">{title}</p> : null}
        {body}
      </ProTip>
    );
  }
  if (tag.startsWith("GOOD TO KNOW") || tag === "FYI" || tag === "NOTE") {
    return (
      <ProTip key={key} label="Good to know">
        {title ? <p className="!font-semibold text-ink-900">{title}</p> : null}
        {body}
      </ProTip>
    );
  }
  // Unknown tag - fall back to a plain blockquote of the whole thing
  return (
    <blockquote
      key={key}
      className="border-l-4 border-electric-500 pl-4 italic text-ink-700 my-4"
    >
      <strong>{tag}</strong> - {title}
      {body}
    </blockquote>
  );
}

// ---------- Block renderer ----------

interface NotionTodoData {
  checked?: boolean;
  rich_text?: NotionRichText[];
}

interface NotionRichBlockData {
  rich_text?: NotionRichText[];
}

interface NotionImageData {
  caption?: NotionRichText[];
  file?: { url?: string };
  external?: { url?: string };
}

interface NotionBookmarkData {
  url?: string;
  caption?: NotionRichText[];
}

function blockText(block: NotionBlock): NotionRichText[] | undefined {
  return (block.data as NotionRichBlockData)?.rich_text;
}

/** Build a stable Checklist id from a section page id + index. */
function checklistId(sectionPageId: string, index: number) {
  return `notion-${sectionPageId.slice(-6)}-${index}`;
}

/** Match Google Maps URLs we know how to resolve into PlaceCards. */
const GMAPS_HOST_RE =
  /^https?:\/\/(www\.)?(google\.[^/]+\/maps|maps\.google\.[^/]+|maps\.app\.goo\.gl|goo\.gl\/maps)/i;

/**
 * If a bulleted_list_item begins with a bold rich-text segment whose
 * href is a Google Maps URL, treat the whole bullet as a venue entry
 * and surface it as a PlaceCard. The rest of the rich text (after the
 * bold link) becomes the descriptive notes.
 */
interface VenueBullet {
  url: string;
  name: string;
  /** Rest of the bullet - area, "-" separator, free-form description, "(our pick)" etc. */
  notes: NotionRichText[];
  /** True when the team marked the entry "(our pick)" - we use it to set a default rating. */
  isPick: boolean;
}

function parseVenueBullet(rt: NotionRichText[] | undefined): VenueBullet | null {
  if (!rt || rt.length === 0) return null;
  const first = rt[0];
  if (!first.href || !GMAPS_HOST_RE.test(first.href)) return null;
  if (!first.annotations?.bold) return null;

  const name = (first.plain_text || "").trim();
  if (!name) return null;

  const notes = rt.slice(1);
  const tail = richTextToString(notes).toLowerCase();
  const isPick = tail.includes("our pick");

  return { url: first.href, name, notes, isPick };
}

interface EmbedBullet {
  url: string;
  kind: EmbedKind;
  /** Editor's link text - title fallback for the card. */
  name: string;
  /** Rest of the bullet (after the link) → card notes. */
  notes: NotionRichText[];
  isPick: boolean;
}

/**
 * If a bulleted_list_item's first rich-text segment links to an Airbnb or
 * GetYourGuide URL, treat the bullet as an accommodation / activity entry
 * and surface it as an EmbedCard. Unlike venue bullets, the link need not
 * be bold - editors often just paste the link.
 */
function parseEmbedBullet(rt: NotionRichText[] | undefined): EmbedBullet | null {
  if (!rt || rt.length === 0) return null;
  const first = rt[0];
  if (!first.href) return null;
  const kind = embedKindForUrl(first.href);
  if (!kind) return null;
  return {
    url: first.href,
    kind,
    name: (first.plain_text || "").trim(),
    notes: rt.slice(1),
    isPick: richTextToString(rt.slice(1)).toLowerCase().includes("our pick")
  };
}

export function NotionRenderer({
  pageId,
  blocks,
  places = {},
  embeds = {}
}: {
  pageId: string;
  blocks: NotionBlock[];
  /** URL → prefetched place data, supplied by fetchSectionPage so the
   *  client doesn't need to round-trip /api/place for each card. */
  places?: Record<string, PlaceData>;
  /** URL → prefetched Airbnb / GetYourGuide embed data. */
  embeds?: Record<string, EmbedData>;
}) {
  // First pass: group consecutive to_do blocks into Checklist clusters.
  const out: React.ReactNode[] = [];
  let i = 0;
  let checklistIndex = 0;

  while (i < blocks.length) {
    const b = blocks[i];

    // Group consecutive to_dos into a Checklist
    if (b.type === "to_do") {
      const start = i;
      const items: string[] = [];
      while (i < blocks.length && blocks[i].type === "to_do") {
        const d = blocks[i].data as NotionTodoData;
        items.push(richTextToString(d.rich_text).trim());
        i++;
      }
      out.push(
        <Checklist
          key={`cl-${start}`}
          id={checklistId(pageId, checklistIndex++)}
          items={items.join("|")}
        />
      );
      continue;
    }

    // Card bullets - a bulleted_list_item that's a Google Maps venue
    // (PlaceCard) or an Airbnb / GetYourGuide link (EmbedCard). A run of
    // consecutive card bullets - mixed types allowed - lays out two-up in
    // one shared grid; a lone card stays full-width.
    if (b.type === "bulleted_list_item") {
      const asCard = (blk: NotionBlock) => {
        const rt = blockText(blk);
        const venue = parseVenueBullet(rt);
        if (venue) return { venue } as const;
        const embed = parseEmbedBullet(rt);
        if (embed) return { embed } as const;
        return null;
      };
      if (asCard(b)) {
        const run: NotionBlock[] = [];
        let j = i;
        while (
          j < blocks.length &&
          blocks[j].type === "bulleted_list_item" &&
          asCard(blocks[j])
        ) {
          run.push(blocks[j]);
          j++;
        }
        const gridded = run.length > 1;
        const cards = run.map((blk, k) => {
          const venue = parseVenueBullet(blockText(blk));
          if (venue) {
            // Strip the leading " · " separator between area and description.
            const notesText = richTextToString(venue.notes)
              .replace(/^\s*[·•]\s*/, "")
              .trim();
            return (
              <PlaceCard
                key={`card-${i}-${k}`}
                url={venue.url}
                name={venue.name}
                ourPick={venue.isPick}
                loveLabel="Good to know"
                lovePoints={notesText ? [notesText] : undefined}
                prefetched={places[venue.url]}
                bare={gridded}
              />
            );
          }
          const e = parseEmbedBullet(blockText(blk))!;
          const noteText = richTextToString(e.notes)
            .replace(/^\s*[·•—–-]\s*/, "")
            .trim();
          return (
            <EmbedCard
              key={`card-${i}-${k}`}
              url={e.url}
              kind={e.kind}
              name={e.name}
              notes={noteText ? [noteText] : undefined}
              ourPick={e.isPick}
              prefetched={embeds[e.url]}
              bare={gridded}
            />
          );
        });
        out.push(
          gridded ? (
            <div
              key={`card-grid-${i}`}
              className="grid grid-cols-1 sm:grid-cols-2 gap-5 my-6"
            >
              {cards}
            </div>
          ) : (
            cards[0]
          )
        );
        i = j;
        continue;
      }
      // Fall through to default <ul><li> handling below.
    }

    // Quote handling - a tagged quote (DON'T -, PRO TIP -, etc.)
    // absorbs the subsequent consecutive untagged quote blocks as its
    // body. That matches the team's authoring pattern in Notion: one
    // quote with the tag + title, then more quote blocks underneath
    // for the body paragraphs.
    if (b.type === "quote") {
      const parsed = parseQuoteTag(blockText(b));
      if (parsed) {
        const bodyBlocks: NotionBlock[] = [];
        let j = i + 1;
        while (j < blocks.length && blocks[j].type === "quote") {
          if (parseQuoteTag(blockText(blocks[j]))) break;
          bodyBlocks.push(blocks[j]);
          j++;
        }
        out.push(
          renderTaggedCallout(parsed.tag, parsed.title, bodyBlocks, `cb-${i}`)
        );
        i = j;
        continue;
      }
      // Untagged quote - plain blockquote
      out.push(renderPlainQuote(blockText(b), `b-${i}`));
      i++;
      continue;
    }

    out.push(renderBlock(b, `b-${i}`));
    i++;
  }

  return <article className="prose-guide max-w-none">{out}</article>;
}

function renderBlock(b: NotionBlock, key: string): React.ReactNode {
  switch (b.type) {
    case "paragraph": {
      const rt = blockText(b);
      // Skip fully-empty paragraphs (Notion uses these as spacers; the
      // CSS prose spacing handles gaps better)
      if (!rt || !richTextToString(rt).trim()) return null;
      return <p key={key}>{richTextToReact(rt)}</p>;
    }
    case "heading_1":
      return <h2 key={key}>{richTextToReact(blockText(b))}</h2>;
    case "heading_2":
      return <h3 key={key}>{richTextToReact(blockText(b))}</h3>;
    case "heading_3":
      return <h4 key={key}>{richTextToReact(blockText(b))}</h4>;
    case "bulleted_list_item":
      return (
        <ul key={key}>
          <li>{richTextToReact(blockText(b))}</li>
        </ul>
      );
    case "numbered_list_item":
      return (
        <ol key={key}>
          <li>{richTextToReact(blockText(b))}</li>
        </ol>
      );
    case "quote":
      // Untagged quotes only reach here as a defensive fallback -
      // the main loop already handles all quote blocks (tagged and
      // untagged) ahead of this switch.
      return renderPlainQuote(blockText(b), key);
    case "divider":
      return <hr key={key} className="my-8 border-ink-100" />;
    case "image": {
      const d = b.data as NotionImageData;
      const src = d.file?.url || d.external?.url;
      if (!src) return null;
      const caption = richTextToString(d.caption);
      return (
        <figure key={key} className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={caption || ""}
            className="rounded-2xl w-full h-auto"
          />
          {caption ? (
            <figcaption className="text-sm text-ink-500 mt-2">
              {caption}
            </figcaption>
          ) : null}
        </figure>
      );
    }
    case "bookmark":
    case "embed":
    case "link_preview": {
      const d = b.data as NotionBookmarkData;
      if (!d.url) return null;
      return (
        <p key={key}>
          <a href={d.url} target="_blank" rel="noopener noreferrer">
            {d.url}
          </a>
        </p>
      );
    }
    case "table": {
      interface TableData {
        table_width?: number;
        has_column_header?: boolean;
      }
      interface TableRowData {
        cells?: NotionRichText[][];
      }
      const tbl = b.data as TableData;
      const rows = (b.children || []).filter((c) => c.type === "table_row");
      if (rows.length === 0) return null;
      const hasHeader = Boolean(tbl.has_column_header);
      return (
        <div key={key} className="my-6 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            {hasHeader ? (
              <thead>
                <tr className="bg-sand-100">
                  {((rows[0].data as TableRowData).cells || []).map((cell, j) => (
                    <th
                      key={j}
                      className="px-3 py-2 text-left font-semibold text-ink-900 border-b border-ink-200"
                    >
                      {richTextToReact(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
            ) : null}
            <tbody>
              {(hasHeader ? rows.slice(1) : rows).map((row, ri) => {
                const cells = (row.data as TableRowData).cells || [];
                return (
                  <tr
                    key={ri}
                    className="border-b border-ink-100 last:border-0"
                  >
                    {cells.map((cell, ci) => (
                      <td
                        key={ci}
                        className={`px-3 py-2 align-top ${
                          ci === 0 ? "font-medium text-ink-900" : "text-ink-700"
                        }`}
                      >
                        {richTextToReact(cell)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    case "code": {
      const text = richTextToString(blockText(b));
      return (
        <pre key={key}>
          <code>{text}</code>
        </pre>
      );
    }
    default:
      // Unknown block type - silent skip in prod, log in dev
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[notion-renderer] unmapped block type: ${b.type}`);
      }
      return null;
  }
}
