import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { SignInForm } from "@/components/SignInForm";

interface PageProps {
  searchParams: { next?: string };
}

export const dynamic = "force-dynamic";

/**
 * Brand-generic sign-in page. Used by the global "Sign in" link in the header.
 * For guide-specific sign-in (used when access is denied for a specific guide),
 * see /guides/[slug]/access which uses LockedAccess instead.
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

  return <SignInForm nextPath={searchParams.next || "/my"} />;
}
