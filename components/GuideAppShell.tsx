"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { GuideMeta } from "@/lib/guides";
import { SectionNav } from "./SectionNav";
import { MobileSectionNav } from "./MobileSectionNav";
import { getSupabaseBrowser } from "@/lib/supabase/client";

interface GuideAppShellProps {
  guide: GuideMeta;
  basePath: string;
  userEmail: string;
  children: React.ReactNode;
}

export function GuideAppShell({
  guide,
  basePath,
  userEmail,
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
      {/* Top bar */}
      <header className="glass sticky top-0 z-40 border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="font-display text-base tracking-tight">
            Freedom Hustle
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-ink-500">
              {userEmail}
            </span>
            <button
              onClick={signOut}
              className="text-xs font-medium text-ink-600 hover:text-ink-900 px-3 py-1.5 rounded-full hover:bg-sand-100"
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
