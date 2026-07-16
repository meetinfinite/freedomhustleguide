import { notFound, redirect } from "next/navigation";
import { getGuide } from "@/lib/guides";
import { GuideAppShell } from "@/components/GuideAppShell";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getMember, hasGuideAccess } from "@/lib/members";

export const dynamic = "force-dynamic";

export default async function GuideAppLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const guide = getGuide(params.slug);
  if (!guide) notFound();

  // Session check
  const supabase = getSupabaseServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect(`/guides/${guide.slug}/access?next=/guides/${guide.slug}/app`);
  }

  // Soon guides are founder-preview only: lifetime members get the full
  // app while the guide is being written; everyone else 404s.
  if (guide.status !== "live") {
    const member = await getMember(user.email);
    if (!member?.lifetime) notFound();
  }

  // Member access check (lifetime OR has this specific guide)
  const allowed = await hasGuideAccess(user.email, guide.slug);
  if (!allowed) {
    redirect(`/guides/${guide.slug}/access?no_access=1`);
  }

  const basePath = `/guides/${guide.slug}/app`;

  return (
    <GuideAppShell guide={guide} basePath={basePath} userEmail={user.email}>
      {children}
    </GuideAppShell>
  );
}
