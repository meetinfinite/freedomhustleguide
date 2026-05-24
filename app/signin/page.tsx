import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getGuide } from "@/lib/guides";
import { LockedAccess } from "@/components/LockedAccess";

interface PageProps {
  searchParams: { next?: string };
}

export const dynamic = "force-dynamic";

/**
 * Global sign-in page. Reuses the LockedAccess UI but pinned to the
 * Bangkok guide as the "marketing context" since that's our only live
 * product right now. After sign-in, the user lands on /my by default.
 */
export default async function SignInPage({ searchParams }: PageProps) {
  const supabase = getSupabaseServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Already signed in → straight to dashboard
  if (user) {
    redirect(searchParams.next || "/my");
  }

  const guide = getGuide("bangkok");
  if (!guide) {
    // Shouldn't happen, but fail gracefully
    redirect("/");
  }

  return (
    <LockedAccess
      guide={guide!}
      nextPath={searchParams.next || "/my"}
    />
  );
}
