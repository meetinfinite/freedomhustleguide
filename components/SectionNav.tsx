"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { GuideMeta } from "@/lib/guides";

interface SectionNavProps {
  guide: GuideMeta;
  basePath: string;
}

export function SectionNav({ guide, basePath }: SectionNavProps) {
  const pathname = usePathname();

  return (
    <nav className="text-sm">
      <Link
        href={basePath}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
          pathname === basePath
            ? "bg-ink-900 text-sand-50"
            : "text-ink-600 hover:text-ink-900 hover:bg-sand-100"
        }`}
      >
        <span>🧭</span>
        <span>Overview</span>
      </Link>
      <div className="mt-4 mb-2 px-3 text-[11px] uppercase tracking-wider text-ink-400 font-semibold">
        Sections
      </div>
      <ul className="space-y-0.5">
        {guide.sections.map((s) => {
          const href = `${basePath}/${s.slug}`;
          const active = pathname === href;
          return (
            <li key={s.slug}>
              <Link
                href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                  active
                    ? "bg-ink-900 text-sand-50"
                    : "text-ink-600 hover:text-ink-900 hover:bg-sand-100"
                }`}
              >
                <span className="w-5 text-center">{s.icon}</span>
                <span className="truncate">{s.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 pt-4 border-t border-ink-100">
        <Link
          href="/my"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-sand-100 transition"
        >
          <span>←</span>
          <span>All my guides</span>
        </Link>
      </div>
    </nav>
  );
}
