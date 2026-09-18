"use client";

import { useRouter } from "next/navigation";
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

  async function signOut() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    router.push(`/guides/${guide.slug}`);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Top bar. No back arrow here on purpose: section pages already
          have a labelled "<- Overview" link, and the All sections drawer
          plus the My Guides menu cover the rest - a header arrow would
          duplicate them. */}
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
