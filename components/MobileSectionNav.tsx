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
    { title: "Dashboard", icon: "🧭" };

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
          <div className="w-full bg-sand-50 rounded-t-3xl max-h-[80vh] overflow-y-auto p-5 pb-safe">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold">
                Jump to
              </p>
              <button
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-ink-600 px-3 py-1 rounded-full hover:bg-ink-100"
              >
                Close
              </button>
            </div>
            <Link
              href={basePath}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-3 rounded-xl text-ink-800 hover:bg-sand-100"
            >
              <span>🧭</span>
              <span>Dashboard</span>
            </Link>
            <ul className="mt-1">
              {guide.sections.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`${basePath}/${s.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-3 py-3 rounded-xl text-ink-800 hover:bg-sand-100"
                  >
                    <span className="w-5 text-center">{s.icon}</span>
                    <span>{s.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-ink-200 mt-3 pt-3">
              <Link
                href="/my"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-3 rounded-xl text-ink-700 hover:bg-sand-100"
              >
                <span>←</span>
                <span>All my guides</span>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
