import Link from "next/link";
import type { GuideMeta } from "@/lib/guides";

interface GuideDashboardProps {
  guide: GuideMeta;
  basePath: string;
}

export function GuideDashboard({ guide, basePath }: GuideDashboardProps) {
  return (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-electric-600 font-semibold mb-3">
          Your guide
        </p>
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight">
          {guide.city}, made simple.
        </h1>
        <p className="text-ink-600 mt-3 max-w-2xl text-lg">
          Jump into any section.
        </p>
      </div>

      {/* One compact row per section - emoji, title, Open. No blurb or
          reading time, so the whole guide fits with little scrolling
          (Valeria, 2026-10-10) */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {guide.sections.map((s) => (
          <Link
            key={s.slug}
            href={`${basePath}/${s.slug}`}
            className="group flex items-center justify-between gap-3 rounded-2xl bg-white border border-ink-100 shadow-card px-4 py-3.5 hover:shadow-pop transition"
          >
            <span className="flex items-center gap-3 min-w-0">
              <span aria-hidden className="text-xl leading-none shrink-0">
                {s.icon}
              </span>
              <span className="font-display text-lg tracking-tight text-ink-900 leading-tight">
                {s.title}
              </span>
            </span>
            <span className="text-sm font-medium text-electric-600 shrink-0 group-hover:translate-x-0.5 transition">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
