"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { GuideMeta } from "@/lib/guides";
import type { Member } from "@/lib/members";

interface MyGuidesDropdownProps {
  guides: GuideMeta[];
  member: Member;
}

export function MyGuidesDropdown({ guides, member }: MyGuidesDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // What does this user actually have access to?
  const ownedSlugs = new Set(member.guides);
  const ownsAll = member.lifetime;
  const liveGuides = guides.filter((g) => g.status === "live");
  const unlocked = liveGuides.filter(
    (g) => ownsAll || ownedSlugs.has(g.slug)
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900 transition px-1 py-1"
      >
        My Guides
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`w-3.5 h-3.5 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full mt-3 w-72 rounded-2xl bg-white border border-ink-100 shadow-pop p-2 fade-up z-50"
        >
          <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-electric-600 font-semibold">
            {ownsAll ? "Lifetime — all guides unlocked" : "Your guides"}
          </div>

          {unlocked.length === 0 ? (
            <div className="px-3 py-3 text-sm text-ink-500">
              You don't own any guides yet.
            </div>
          ) : (
            <ul>
              {unlocked.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/guides/${g.slug}/app`}
                    onClick={() => setOpen(false)}
                    role="menuitem"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sand-50 transition !no-underline"
                  >
                    <span className="text-xl leading-none shrink-0">
                      {g.flag}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-ink-900 truncate">
                        {g.city}
                      </div>
                      <div className="text-[11px] text-ink-500 truncate">
                        {g.country}
                      </div>
                    </div>
                    <span className="text-electric-600 text-sm shrink-0">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-ink-100 mt-2 pt-2">
            <Link
              href="/my"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-ink-700 hover:bg-sand-50 transition !no-underline"
            >
              <span>Your dashboard</span>
              <span className="text-electric-600">→</span>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
