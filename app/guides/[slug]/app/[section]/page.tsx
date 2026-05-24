import { notFound } from "next/navigation";
import { getGuide, getSection } from "@/lib/guides";
import client from "@/tina/__generated__/client";
import { GuideSectionView } from "@/components/GuideSectionView";

interface PageProps {
  params: { slug: string; section: string };
}

export const dynamic = "force-dynamic";

export default async function GuideSectionPage({ params }: PageProps) {
  const guide = getGuide(params.slug);
  if (!guide || guide.status !== "live") notFound();
  const section = getSection(params.slug, params.section);
  if (!section) notFound();

  let tinaResult;
  try {
    tinaResult = await client.queries.section({
      relativePath: `${params.slug}/${params.section}.mdx`
    });
  } catch (err) {
    console.error(
      `[tina] failed to fetch ${params.slug}/${params.section}.mdx`,
      err
    );
    notFound();
  }

  const sections = guide.sections;
  const idx = sections.findIndex((s) => s.slug === section.slug);
  const prev = idx > 0 ? sections[idx - 1] : null;
  const next = idx < sections.length - 1 ? sections[idx + 1] : null;
  const basePath = `/guides/${guide.slug}/app`;

  return (
    <GuideSectionView
      data={tinaResult.data}
      query={tinaResult.query}
      variables={tinaResult.variables}
      nav={{
        basePath,
        icon: section.icon,
        readingTime: section.readingTime,
        prev,
        next
      }}
    />
  );
}
