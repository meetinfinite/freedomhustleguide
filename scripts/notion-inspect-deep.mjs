// Deep-inspect a page — show full rich_text annotations + hrefs.
// node scripts/notion-inspect-deep.mjs <page-id> [block-index]

import { Client } from "@notionhq/client";

const token = process.env.NOTION_TOKEN;
const notion = new Client({ auth: token });
const pageId = process.argv[2];
const startIdx = parseInt(process.argv[3] || "3", 10);

const res = await notion.blocks.children.list({ block_id: pageId, page_size: 100 });

console.log(`Showing blocks ${startIdx}–${startIdx + 4} in detail:\n`);
for (const b of res.results.slice(startIdx, startIdx + 5)) {
  if (!("type" in b)) continue;
  console.log(`── ${b.type} (${b.id.slice(-12)})${b.has_children ? "  (has children)" : ""}`);
  const payload = b[b.type];
  if (payload?.rich_text) {
    payload.rich_text.forEach((r, i) => {
      const parts = [];
      if (r.annotations?.bold) parts.push("bold");
      if (r.annotations?.italic) parts.push("italic");
      if (r.annotations?.code) parts.push("code");
      const flag = parts.length ? ` [${parts.join(",")}]` : "";
      const href = r.href ? `  → ${r.href}` : "";
      console.log(`   ${i}: "${r.plain_text}"${flag}${href}`);
    });
  }
  console.log("");
}
