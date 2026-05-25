import { notFound } from "next/navigation";
import { getGuide } from "@/lib/guides";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getMember } from "@/lib/members";
import { GuideDashboard } from "@/components/GuideDashboard";
import { LifetimeUpsellBanner } from "@/components/LifetimeUpsellBanner";
import { MyMapEmbed } from "@/components/MyMapEmbed";

export const dynamic = "force-dynamic";

export default async function GuideAppDashboard({
  params
}: {
  params: { slug: string };
}) {
  const guide = getGuide(params.slug);
  if (!guide || guide.status !== "live") notFound();

  // Auth already enforced by the parent layout — re-fetch member to decide
  // whether to show the lifetime upsell. Free + fast (one Supabase call).
  const supabase = getSupabaseServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const member = user?.email ? await getMember(user.email) : null;
  const showUpsell = Boolean(member && !member.lifetime);
  const basePath = `/guides/${guide.slug}/app`;

  return (
    <>
      {showUpsell && user?.email ? (
        <LifetimeUpsellBanner
          userEmail={user.email}
          returnPath={basePath}
        />
      ) : null}
      {guide.myMapsId ? (
        <MyMapEmbed mid={guide.myMapsId} city={guide.city} />
      ) : null}
      <GuideDashboard guide={guide} basePath={basePath} />
    </>
  );
}
