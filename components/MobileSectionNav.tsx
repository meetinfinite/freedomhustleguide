"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { GuideMeta } from "@/lib/guides";

interface MobileSectionNavProps {
  guide: GuideMeta;
  basePath: string;
}

export function MobileSectionNav({ guide, basePath }: MobileSectionNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const current =
    guide.sections.find((s) => pathname === `${basePath}/${s.slug}`) ||
    { title: "Overview", icon: "🧭" };

  return (
    <>
      <div className="lg:hidden sticky top-16 z-30 glass border-b border-ink-100">
        <button
          onClick={() => setOpen(true)}
          className="w-full px-5 py-3 flex items-center justify-between text-left"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-ink-800">
            <span>{current.icon}</span>
            <span>{current.title}</span>
          </span>
          <span className="text-xs text-ink-500 font-semibold uppercase tracking-wider">
            All sections ↗
          </span>
        </button>
      </div>

      {open ? (
        <div className="lg:hidden fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-sm flex items-end">
          {/* Compact rows so every section fits on a phone screen without
              scrolling (Valeria, 2026-10-10) */}
          <div className="w-full bg-sand-50 rounded-t-3xl max-h-[92vh] overflow-y-auto px-4 pt-4 pb-safe">
            <div className="flex items-center justify-between mb-1 px-1">
              <Link
                href="/my"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-ink-600 py-1"
              >
                ← All my guides
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-ink-600 px-3 py-1 rounded-full hover:bg-ink-100"
              >
                Close
              </button>
            </div>
            <ul className="pb-3">
              {[{ slug: "", title: "Overview", icon: "🧭" }, ...guide.sections].map(
                (s) => {
                  const href = s.slug ? `${basePath}/${s.slug}` : basePath;
                  const active = pathname === href;
                  return (
                    <li key={s.slug || "overview"}>
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[15px] leading-tight ${
                          active
                            ? "bg-ink-900 text-sand-50"
                            : "text-ink-800 hover:bg-sand-100"
                        }`}
                      >
                        <span className="w-5 text-center">{s.icon}</span>
                        <span>{s.title}</span>
                      </Link>
                    </li>
                  );
                }
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
