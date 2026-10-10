import { notFound } from "next/navigation";
import { getGuide } from "@/lib/guides";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getMember } from "@/lib/members";
import { GuideDashboard } from "@/components/GuideDashboard";
import { MyMapEmbed } from "@/components/MyMapEmbed";
import { DesktopSectionRedirect } from "@/components/DesktopSectionRedirect";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function GuideAppDashboard({
  params
}: {
  params: { slug: string };
}) {
  const guide = getGuide(params.slug);
  if (!guide) notFound();

  // Auth already enforced by the parent layout - re-fetch member to decide
  // whether to show the lifetime upsell. Free + fast (one Supabase call).
  const supabase = getSupabaseServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const member = user?.email ? await getMember(user.email) : null;

  // Soon guides are team-preview only: lifetime members (the founders)
  // can watch content render while it's being written; everyone else 404s.
  if (guide.status !== "live" && !member?.lifetime) notFound();
  const showUpsell = Boolean(member && !member.lifetime);
  const basePath = `/guides/${guide.slug}/app`;
  const first = guide.sections[0];
  const firstHref = first ? `${basePath}/${first.slug}` : basePath;

  return (
    <>
      {/* Desktop skips the overview (the sidebar lists every section) and
          opens the first section; phones keep it. */}
      {first ? <DesktopSectionRedirect href={firstHref} /> : null}
      {first ? (
        <div className="hidden lg:block text-ink-500">
          <Link href={firstHref} className="hover:text-ink-900">
            Opening {first.title} →
          </Link>
        </div>
      ) : null}
      <div className={first ? "lg:hidden" : undefined}>
        {/* Lifetime upsell paused until the guide library is bigger
            (Valeria, 2026-08-05) - restore LifetimeUpsellBanner here. */}
        <GuideDashboard guide={guide} basePath={basePath} />
        {guide.myMapsId ? (
          <div className="mt-12">
            <MyMapEmbed mid={guide.myMapsId} city={guide.city} />
          </div>
        ) : null}
      </div>
    </>
  );
}
