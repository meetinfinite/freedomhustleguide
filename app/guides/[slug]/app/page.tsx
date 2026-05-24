import { notFound } from "next/navigation";
import { getGuide } from "@/lib/guides";
import { GuideDashboard } from "@/components/GuideDashboard";

export default function GuideAppDashboard({
  params
}: {
  params: { slug: string };
}) {
  const guide = getGuide(params.slug);
  if (!guide || guide.status !== "live") notFound();

  return (
    <GuideDashboard guide={guide} basePath={`/guides/${guide.slug}/app`} />
  );
}
