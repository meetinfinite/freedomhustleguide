import { Fragment } from "react";
import type { NotionBlock } from "@/lib/notion";
import { WarningCard } from "./WarningCard";
import { ProTip } from "./ProTip";
import { Checklist } from "./Checklist";

/**
 * Render a Notion page's blocks as React.
 *
 * Convention-driven smart mapping:
 *   - Consecutive `to_do` blocks are grouped into one <Checklist> with
 *     localStorage progress tracking.
 *   - `quote` blocks read their leading text to choose a style:
 *       "DON'T —"        → <WarningCard severity="warn">
 *       "PRO TIP —"      → <ProTip>
 *       "GOOD TO KNOW —" → <ProTip label="Good to know">
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

function renderQuote(rt: NotionRichText[] | undefined, key: string) {
  const text = richTextToString(rt).trim();
  const m = text.match(/^([A-Z][A-Z'\s]+)\s*[—–-]\s*(.*)/s);
  if (m) {
    const tag = m[1].trim().toUpperCase();
    const remainder = m[2];

    if (tag.startsWith("DON'T") || tag === "AVOID" || tag === "WARNING") {
      return (
        <WarningCard key={key} title={tag} severity="warn">
          {remainder}
        </WarningCard>
      );
    }
    if (tag.startsWith("DANGER") || tag === "NEVER") {
      return (
        <WarningCard key={key} title={tag} severity="danger">
          {remainder}
        </WarningCard>
      );
    }
    if (tag.startsWith("PRO TIP")) {
      return (
        <ProTip key={key} label="Pro tip">
          {remainder}
        </ProTip>
      );
    }
    if (tag.startsWith("GOOD TO KNOW") || tag === "FYI" || tag === "NOTE") {
      return (
        <ProTip key={key} label="Good to know">
          {remainder}
        </ProTip>
      );
    }
  }
  // Fallback — render as a real blockquote
  return (
    <blockquote
      key={key}
      className="border-l-4 border-electric-500 pl-4 italic text-ink-700 my-4"
    >
      {richTextToReact(rt)}
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

export function NotionRenderer({
  pageId,
  blocks
}: {
  pageId: string;
  blocks: NotionBlock[];
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
      return renderQuote(blockText(b), key);
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
    case "code": {
      const text = richTextToString(blockText(b));
      return (
        <pre key={key}>
          <code>{text}</code>
        </pre>
      );
    }
    default:
      // Unknown block type — silent skip in prod, log in dev
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[notion-renderer] unmapped block type: ${b.type}`);
      }
      return null;
  }
}
