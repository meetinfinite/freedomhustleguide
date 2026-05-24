import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface MdxFile {
  source: string;
  frontmatter: Record<string, unknown>;
}

export function loadGuideSectionMdx(
  guideSlug: string,
  sectionSlug: string
): MdxFile | null {
  const filePath = path.join(
    process.cwd(),
    "content",
    "guides",
    guideSlug,
    `${sectionSlug}.mdx`
  );
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { content, data } = matter(raw);
  return { source: content, frontmatter: data };
}
