import Link from "next/link";
import type { GuideMeta } from "@/lib/guides";

interface GuideDashboardProps {
  guide: GuideMeta;
  basePath: string;
}

export function GuideDashboard({ guide, basePath }: GuideDashboardProps) {
  return (
    <div>
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.18em] text-electric-600 font-semibold mb-3">
          Your guide
        </p>
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight">
          {guide.city}, made simple.
        </h1>
        <p className="text-ink-600 mt-3 max-w-2xl text-lg">
          Jump into any section. Your checklists save automatically.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {guide.sections.map((s) => (
          <Link
            key={s.slug}
            href={`${basePath}/${s.slug}`}
            className="group rounded-2xl bg-white border border-ink-100 shadow-card p-6 hover:shadow-pop hover:-translate-y-0.5 transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-sand-100 grid place-items-center text-xl">
                {s.icon}
              </div>
              <span className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">
                {s.readingTime}
              </span>
            </div>
            <h3 className="font-display text-lg tracking-tight text-ink-900">
              {s.title}
            </h3>
            <p className="text-sm text-ink-500 mt-1">{s.description}</p>
            <p className="text-sm font-medium text-electric-600 mt-4 group-hover:translate-x-0.5 transition">
              Open →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
