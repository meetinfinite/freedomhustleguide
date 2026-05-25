import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_ROOT = path.join(process.cwd(), "content", "guides");

export interface SectionSource {
  /** Frontmatter title — falls back to the section meta title if missing */
  title: string;
  /** Frontmatter description — appears under the H1 */
  description?: string;
  /** Raw MDX content body (post-frontmatter) — handed to compileMDX */
  body: string;
}

/**
 * Read a guide section's MDX file from disk and split out the frontmatter.
 *
 * Returns `null` when the file doesn't exist — the caller is expected to
 * `notFound()` in that case. Throws on IO errors other than ENOENT so we
 * don't accidentally render a half-broken page when the disk is at fault.
 */
export async function readSection(
  guideSlug: string,
  sectionSlug: string
): Promise<SectionSource | null> {
  const filePath = path.join(CONTENT_ROOT, guideSlug, `${sectionSlug}.mdx`);

  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "ENOENT"
    ) {
      return null;
    }
    throw err;
  }

  const { data, content } = matter(raw);
  return {
    title: typeof data.title === "string" ? data.title : sectionSlug,
    description:
      typeof data.description === "string" ? data.description : undefined,
    body: content
  };
}
