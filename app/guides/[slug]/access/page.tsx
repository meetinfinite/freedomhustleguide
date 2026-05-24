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

  const checkoutUrl =
    process.env.NEXT_PUBLIC_CHECKOUT_URL || `/guides/${guide.slug}`;

  return (
    <LockedAccess
      guide={guide}
      checkoutUrl={checkoutUrl}
      nextPath={searchParams.next}
      noAccess={searchParams.no_access === "1"}
    />
  );
}
