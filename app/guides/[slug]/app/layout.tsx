import { notFound, redirect } from "next/navigation";
import { getGuide } from "@/lib/guides";
import { GuideAppShell } from "@/components/GuideAppShell";
import { getSupabaseServer } from "@/lib/supabase/server";
import { hasGuideAccess } from "@/lib/members";

export const dynamic = "force-dynamic";

export default async function GuideAppLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const guide = getGuide(params.slug);
  if (!guide || guide.status !== "live") notFound();

  // Session check
  const supabase = getSupabaseServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect(`/guides/${guide.slug}/access?next=/guides/${guide.slug}/app`);
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
