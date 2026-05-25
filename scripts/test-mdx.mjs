// One-shot diagnostic: try to compile every MDX file under content/guides
// and report which (if any) fail.

import { compile } from "@mdx-js/mdx";
import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = path.join(process.cwd(), "content", "guides");

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (entry.isFile() && entry.name.endsWith(".mdx")) yield p;
  }
}

let failed = 0;
for await (const file of walk(root)) {
  const rel = path.relative(process.cwd(), file);
  try {
    const raw = await fs.readFile(file, "utf8");
    const { content } = matter(raw);
    await compile(content, { jsx: true });
    console.log("✓", rel);
  } catch (err) {
    failed++;
    console.log("✗", rel);
    console.log("  ", err.message.split("\n")[0]);
    if (err.line) console.log("   at line", err.line);
  }
}

console.log(failed === 0 ? "\nAll MDX files compile." : `\n${failed} file(s) failed.`);
