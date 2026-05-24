import { notFound } from "next/navigation";
import { getGuide } from "@/lib/guides";
import { LockedAccess } from "@/components/LockedAccess";

interface PageProps {
  params: { slug: string };
  searchParams: { next?: string; no_access?: string };
}

export default function AccessPage({ params, searchParams }: PageProps) {
  const guide = getGuide(params.slug);
  if (!guide || guide.status !== "live") notFound();

  return (
    <LockedAccess
      guide={guide}
      nextPath={searchParams.next}
      noAccess={searchParams.no_access === "1"}
    />
  );
}
