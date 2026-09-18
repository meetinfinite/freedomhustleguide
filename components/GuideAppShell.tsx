"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import type { GuideMeta } from "@/lib/guides";
import type { Member } from "@/lib/members";
import { SectionNav } from "./SectionNav";
import { MobileSectionNav } from "./MobileSectionNav";
import { BrandLogo } from "./BrandLogo";
import { MyGuidesDropdown } from "./MyGuidesDropdown";
import { HomeLink } from "./HomeLink";
import { getSupabaseBrowser } from "@/lib/supabase/client";

interface GuideAppShellProps {
  guide: GuideMeta;
  basePath: string;
  userEmail: string;
  allGuides: GuideMeta[];
  member: Member | null;
  children: React.ReactNode;
}

export function GuideAppShell({
  guide,
  basePath,
  userEmail,
  allGuides,
  member,
  children
}: GuideAppShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Back always goes one level up rather than browser-back: buyers often
  // land here straight from the sign-in email, where history-back would
  // drop them out of the site. Section -> overview, overview -> My guides.
  const onOverview = pathname === basePath || pathname === `${basePath}/`;
  const backHref = onOverview ? "/my" : basePath;
  const backLabel = onOverview ? "My guides" : "Overview";

  async function signOut() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    router.push(`/guides/${guide.slug}`);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Top bar */}
      <header className="glass sticky top-0 z-40 border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-5">
            <Link
              href="/"
              aria-label="Freedom Hustle - home"
              className="flex items-center"
            >
              <BrandLogo height={32} />
            </Link>
            <Link
              href={backHref}
              aria-label={`Back to ${backLabel}`}
              className="order-first sm:order-none inline-flex items-center justify-center gap-1.5 w-9 h-9 sm:w-auto sm:h-auto -ml-2 sm:ml-0 rounded-full text-sm text-ink-700 hover:text-ink-900 hover:bg-sand-100 sm:hover:bg-transparent transition"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 sm:w-3.5 sm:h-3.5"
                aria-hidden
              >
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="hidden sm:inline">{backLabel}</span>
            </Link>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <HomeLink />
            {member ? (
              <MyGuidesDropdown guides={allGuides} member={member} />
            ) : null}
            <span className="hidden sm:inline text-xs text-ink-500">
              {userEmail}
            </span>
            <button
              onClick={signOut}
              className="text-xs font-medium text-ink-600 hover:text-ink-900 px-2 sm:px-3 py-1.5 rounded-full hover:bg-sand-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <MobileSectionNav guide={guide} basePath={basePath} />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-8 lg:py-12 grid lg:grid-cols-[260px_1fr] gap-10">
        <aside className="hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
          <SectionNav guide={guide} basePath={basePath} />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
