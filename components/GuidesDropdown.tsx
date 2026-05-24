"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { GuideMeta } from "@/lib/guides";

interface GuidesDropdownProps {
  guides: GuideMeta[];
}

export function GuidesDropdown({ guides }: GuidesDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click-outside + Escape
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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900 transition px-1 py-1"
      >
        Guides
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
          {guides.map((g) => {
            const isLive = g.status === "live";

            const body = (
              <>
                <span className="text-xl leading-none shrink-0">{g.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-ink-900 truncate">
                    {g.city}
                  </div>
                  <div className="text-[11px] text-ink-500 truncate">
                    {g.country}
                  </div>
                </div>
                {isLive ? (
                  <span className="text-electric-600 text-sm shrink-0">→</span>
                ) : (
                  <span className="text-[10px] uppercase tracking-wider font-bold text-ink-400 bg-ink-100 px-2 py-0.5 rounded-full shrink-0">
                    Soon
                  </span>
                )}
              </>
            );

            return isLive ? (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                onClick={() => setOpen(false)}
                role="menuitem"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sand-50 transition !no-underline"
              >
                {body}
              </Link>
            ) : (
              <div
                key={g.slug}
                role="menuitem"
                aria-disabled
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl opacity-60 cursor-not-allowed"
              >
                {body}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
