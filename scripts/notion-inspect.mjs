// Fetch the blocks of one Notion page and dump a structural summary.
// Tells us what block types your team uses so we know what to map in
// the renderer.
//
// Usage:
//   set -a && source .env.local && set +a && node scripts/notion-inspect.mjs <page-id>
//
// Defaults to "01 · First 24 Hours" if no id passed.

import { Client } from "@notionhq/client";

const token = process.env.NOTION_TOKEN;
if (!token) {
  console.error("NOTION_TOKEN not set. Source .env.local first.");
  process.exit(1);
}

const notion = new Client({ auth: token });

const pageId = process.argv[2] || "41c57b19-7874-82d8-a0fc-81a76e3afe32";

// 1. Fetch the page itself to get title + properties
const page = await notion.pages.retrieve({ page_id: pageId });
const title =
  Object.values(page.properties || {}).find((p) => p?.type === "title")
    ?.title?.[0]?.plain_text || "(untitled)";

console.log("Page:", title);
console.log("ID:  ", pageId);
console.log("");

// 2. Paginate through all blocks
const blocks = [];
let cursor;
do {
  const res = await notion.blocks.children.list({
    block_id: pageId,
    start_cursor: cursor,
    page_size: 100
  });
  blocks.push(...res.results);
  cursor = res.has_more ? res.next_cursor : undefined;
} while (cursor);

console.log(`Total top-level blocks: ${blocks.length}`);
console.log("");

// 3. Summarise by type
const typeCounts = {};
for (const b of blocks) {
  typeCounts[b.type] = (typeCounts[b.type] || 0) + 1;
}
console.log("Block type counts:");
for (const [type, count] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${type.padEnd(25)} ${count}`);
}
console.log("");

// 4. Dump first ~25 blocks with a preview of their content
console.log("First blocks (sample of structure):");
console.log("─".repeat(60));
for (const b of blocks.slice(0, 25)) {
  let preview = "";
  const content = b[b.type];

  // Most rich-text blocks store text under `rich_text`
  if (content?.rich_text?.length) {
    preview = content.rich_text
      .map((r) => r.plain_text)
      .join("")
      .slice(0, 80);
  } else if (b.type === "callout") {
    const icon = content?.icon?.emoji || "?";
    const text = (content?.rich_text || []).map((r) => r.plain_text).join("");
    preview = `${icon}  ${text.slice(0, 70)}`;
  } else if (b.type === "bookmark" || b.type === "embed" || b.type === "link_preview") {
    preview = content?.url || "(no url)";
  } else if (b.type === "image") {
    preview =
      content?.file?.url || content?.external?.url || "(no url)";
  } else if (b.type === "child_page") {
    preview = content?.title || "(no title)";
  } else if (b.type === "to_do") {
    const checked = content?.checked ? "[x]" : "[ ]";
    const text = (content?.rich_text || []).map((r) => r.plain_text).join("");
    preview = `${checked} ${text.slice(0, 70)}`;
  } else if (b.type === "code") {
    const lang = content?.language || "";
    const text = (content?.rich_text || []).map((r) => r.plain_text).join("");
    preview = `(${lang}) ${text.slice(0, 60)}`;
  }

  // Note when a block has children
  const hasKids = b.has_children ? "  ↳children" : "";
  console.log(
    `  ${b.type.padEnd(20)} ${preview}${hasKids}`
  );
}
if (blocks.length > 25) {
  console.log(`  …${blocks.length - 25} more blocks`);
}
