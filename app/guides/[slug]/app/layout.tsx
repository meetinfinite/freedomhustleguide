import { notFound } from "next/navigation";
import { getGuide } from "@/lib/guides";
import { GuideAppShell } from "@/components/GuideAppShell";

export default function GuideAppLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const guide = getGuide(params.slug);
  if (!guide || guide.status !== "live") notFound();

  const basePath = `/guides/${guide.slug}/app`;

  return (
    <GuideAppShell guide={guide} basePath={basePath}>
      {children}
    </GuideAppShell>
  );
}
