// Sanity-check the Notion token + list everything the integration can see.
// Run: set -a && source .env.local && set +a && node scripts/notion-probe.mjs

import { Client } from "@notionhq/client";

const token = process.env.NOTION_TOKEN;
if (!token) {
  console.error("NOTION_TOKEN not set. Source .env.local first.");
  process.exit(1);
}

const notion = new Client({ auth: token });

// 1. Confirm the token works by fetching the integration's bot user
try {
  const me = await notion.users.me({});
  console.log("✓ Token works.");
  console.log("  Bot name:", me.name);
  if (me.bot?.workspace_name) {
    console.log("  Workspace:", me.bot.workspace_name);
  }
} catch (err) {
  console.error("✗ Token failed:", err.message);
  process.exit(1);
}

console.log("");

// 2. Search for anything shared with the integration
const result = await notion.search({
  page_size: 50,
  sort: { direction: "descending", timestamp: "last_edited_time" }
});

if (!result.results.length) {
  console.log(
    "⚠️  Integration has access to 0 pages/databases.\n\n" +
      "Go to the page (or database) holding your guide content in Notion:\n" +
      "  → click the `⋯` menu top-right\n" +
      "  → Connections (or Connect to)\n" +
      "  → search for 'Freedom Hustle Site'\n" +
      "  → confirm\n\n" +
      "Then re-run this script."
  );
  process.exit(0);
}

console.log(`✓ Integration can see ${result.results.length} item(s):\n`);

for (const item of result.results) {
  const type = item.object;
  const id = item.id;
  let title = "(untitled)";

  if (type === "page") {
    // Page title can live in any property of type "title"
    const titleProp = Object.values(item.properties || {}).find(
      (p) => p?.type === "title"
    );
    title = titleProp?.title?.[0]?.plain_text || "(untitled)";
    // Pages also sometimes have a top-level title block
    if (title === "(untitled)" && item.properties?.title?.title?.[0]) {
      title = item.properties.title.title[0].plain_text;
    }
  } else if (type === "database") {
    title = item.title?.[0]?.plain_text || "(untitled database)";
  }

  console.log(`  [${type.padEnd(8)}] ${id}  ${title}`);
}
