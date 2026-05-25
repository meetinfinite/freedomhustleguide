import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide, getSection } from "@/lib/guides";
import { readSection } from "@/lib/mdx";
import { MdxRenderer } from "@/components/MdxRenderer";

interface PageProps {
  params: { slug: string; section: string };
}

export const dynamic = "force-dynamic";

export default async function GuideSectionPage({ params }: PageProps) {
  const guide = getGuide(params.slug);
  if (!guide || guide.status !== "live") notFound();

  const section = getSection(params.slug, params.section);
  if (!section) notFound();

  const mdx = await readSection(params.slug, params.section);
  if (!mdx) notFound();

  const sections = guide.sections;
  const idx = sections.findIndex((s) => s.slug === section.slug);
  const prev = idx > 0 ? sections[idx - 1] : null;
  const next = idx < sections.length - 1 ? sections[idx + 1] : null;
  const basePath = `/guides/${guide.slug}/app`;

  return (
    <div>
      <div className="mb-8 flex items-center gap-3 text-sm text-ink-500">
        <Link href={basePath} className="hover:text-ink-900">
          ← Dashboard
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
          {mdx.title}
        </h1>
        {mdx.description ? (
          <p className="text-ink-600 mt-3 text-lg">{mdx.description}</p>
        ) : null}
      </header>

      <MdxRenderer source={mdx.body} />

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
