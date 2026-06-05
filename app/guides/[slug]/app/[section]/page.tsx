import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide, getSection } from "@/lib/guides";
import { readSection } from "@/lib/mdx";
import { fetchSectionPage } from "@/lib/notion";
import { MdxRenderer } from "@/components/MdxRenderer";
import { NotionRenderer } from "@/components/NotionRenderer";

interface PageProps {
  params: { slug: string; section: string };
}

// Re-fetch Notion content at most every 60s. Cached between requests
// to stay inside Notion's rate limits while still feeling live.
export const revalidate = 60;

export default async function GuideSectionPage({ params }: PageProps) {
  const guide = getGuide(params.slug);
  if (!guide || guide.status !== "live") notFound();

  const section = getSection(params.slug, params.section);
  if (!section) notFound();

  // Prefer Notion when the section has a page ID. Fall back to MDX if
  // Notion fails or no ID is configured.
  const notionPage = section.notionPageId
    ? await fetchSectionPage(section.notionPageId)
    : null;

  let title = section.title;
  // Description only comes from MDX frontmatter (or the template fallback
  // when MDX is used). When the section reads from Notion, the team
  // owns the intro prose at the top of the page — we don't surface a
  // separate description tagline.
  let description: string | undefined;
  let body: React.ReactNode;

  if (notionPage) {
    // The page title in Notion looks like "01 · First 24 Hours" — strip
    // the leading number so the H1 is clean.
    title = notionPage.title.replace(/^\d+\s*[·.\-]\s*/, "").trim() || section.title;
    // Pulled from the italic first paragraph by fetchSectionPage. The
    // body blocks already have that paragraph removed.
    description = notionPage.description;
    body = <NotionRenderer pageId={notionPage.id} blocks={notionPage.blocks} />;
  } else {
    const mdx = await readSection(params.slug, params.section);
    if (!mdx) notFound();
    title = mdx.title;
    description = mdx.description ?? section.description;
    body = <MdxRenderer source={mdx.body} />;
  }

  const sections = guide.sections;
  const idx = sections.findIndex((s) => s.slug === section.slug);
  const prev = idx > 0 ? sections[idx - 1] : null;
  const next = idx < sections.length - 1 ? sections[idx + 1] : null;
  const basePath = `/guides/${guide.slug}/app`;

  return (
    <div>
      <div className="mb-8 flex items-center gap-3 text-sm text-ink-500">
        <Link href={basePath} className="hover:text-ink-900">
          ← Overview
        </Link>
        <span>·</span>
        <span>{section.readingTime}</span>
      </div>

      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-sand-100 grid place-items-center text-2xl">
            {section.icon}
          </div>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="text-ink-600 mt-3 text-lg">{description}</p>
        ) : null}
      </header>

      {body}

      <div className="mt-16 grid sm:grid-cols-2 gap-4">
        {prev ? (
          <Link
            href={`${basePath}/${prev.slug}`}
            className="group rounded-2xl bg-white border border-ink-100 shadow-card p-5 hover:shadow-pop transition"
          >
            <p className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">
              Previous
            </p>
            <p className="font-display text-lg tracking-tight mt-1">
              ← {prev.title}
            </p>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`${basePath}/${next.slug}`}
            className="group rounded-2xl bg-white border border-ink-100 shadow-card p-5 hover:shadow-pop transition sm:text-right"
          >
            <p className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">
              Next
            </p>
            <p className="font-display text-lg tracking-tight mt-1">
              {next.title} →
            </p>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
