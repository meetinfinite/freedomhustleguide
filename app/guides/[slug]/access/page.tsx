import { notFound } from "next/navigation";
import { getGuide } from "@/lib/guides";
import { LockedAccess } from "@/components/LockedAccess";

export default function AccessPage({
  params
}: {
  params: { slug: string };
}) {
  const guide = getGuide(params.slug);
  if (!guide || guide.status !== "live") notFound();

  const checkoutUrl =
    process.env.NEXT_PUBLIC_CHECKOUT_URL || `/guides/${guide.slug}`;

  return <LockedAccess guide={guide} checkoutUrl={checkoutUrl} />;
}
