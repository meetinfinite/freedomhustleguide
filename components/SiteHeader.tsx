import Link from "next/link";
import { listGuides } from "@/lib/guides";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getMember } from "@/lib/members";
import { GuidesDropdown } from "./GuidesDropdown";
import { MyGuidesDropdown } from "./MyGuidesDropdown";
import { SignOutButton } from "./SignOutButton";
import { BuyButton } from "./BuyButton";

/**
 * Site-wide header. Auth-aware — detects the signed-in user server-side
 * and switches between "Sign in / Buy" and "My Guides / Sign out" layouts.
 */
export async function SiteHeader() {
  const guides = listGuides();
  const supabase = getSupabaseServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const member = user?.email ? await getMember(user.email) : null;

  return (
    <nav className="glass sticky top-0 z-40 border-b border-ink-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-lg tracking-tight">
          Freedom Hustle
        </Link>

        <div className="flex items-center gap-5">
          {user && member ? (
            <>
              <MyGuidesDropdown guides={guides} member={member} />
              <SignOutButton email={user.email!} />
            </>
          ) : user ? (
            // Signed in but no member record yet (mid-purchase race, or
            // signed in without ever buying). Show Sign-out + a Buy CTA.
            <>
              <GuidesDropdown guides={guides} />
              <SignOutButton email={user.email!} />
              <BuyButton
                product="lifetime"
                returnPath="/my"
                customerEmail={user.email!}
                className="hidden sm:inline-flex px-4 py-2 rounded-full bg-ink-900 text-sand-50 text-sm font-medium hover:bg-ink-700 transition cursor-pointer"
              >
                Buy Lifetime Access
              </BuyButton>
            </>
          ) : (
            <>
              <GuidesDropdown guides={guides} />
              <Link
                href="/signin"
                className="text-sm text-ink-600 hover:text-ink-900"
              >
                Sign in
              </Link>
              <BuyButton
                product="lifetime"
                returnPath="/"
                className="hidden sm:inline-flex px-4 py-2 rounded-full bg-ink-900 text-sand-50 text-sm font-medium hover:bg-ink-700 transition cursor-pointer"
              >
                Buy Lifetime Access
              </BuyButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
