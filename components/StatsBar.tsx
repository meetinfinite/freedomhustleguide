const STATS = [
  { value: "560+", label: "Happy nomads" },
  { value: "4.9★", label: "Avg buyer rating" },
  { value: "7", label: "Countries shipped to" },
  { value: "30+", label: "Value-packed guides coming soon" }
];

export function StatsBar() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <div className="rounded-3xl bg-white border border-ink-100 shadow-card overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-ink-100">
          {STATS.map((s) => (
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
