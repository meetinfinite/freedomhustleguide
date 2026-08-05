/**
 * Stats bar. NOT rendered anywhere right now, on purpose.
 *
 * It previously hardcoded invented figures ("560+ happy nomads",
 * "4.9★ avg buyer rating"). Fabricated social proof breaches Meta's
 * Community Standards and UK consumer law (DMCC Act 2024) — it got the
 * site's Instagram link blocked. So the numbers are now a REQUIRED PROP:
 * this component cannot render a figure that wasn't passed in from real
 * data. Don't reintroduce a default array.
 */

export interface Stat {
  value: string;
  label: string;
}
export function StatsBar({ stats }: { stats: Stat[] }) {
  if (!stats.length) return null;
  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <div className="rounded-3xl bg-white border border-ink-100 shadow-card overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-ink-100">
          {stats.map((s) => (
            <div key={s.label} className="p-6 text-center">
              <div className="font-display text-3xl sm:text-4xl text-electric-600 tracking-tight">
                {s.value}
              </div>
              <div className="text-xs uppercase tracking-wider text-ink-500 font-semibold mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
