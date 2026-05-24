interface CoworkingCardProps {
  name: string;
  area: string;
  dayPass: string;
  vibe: string;
  bestFor: string;
  pros: string[];
  cons: string[];
  link?: string;
}

export function CoworkingCard({
  name,
  area,
  dayPass,
  vibe,
  bestFor,
  pros,
  cons,
  link
}: CoworkingCardProps) {
  return (
    <div className="rounded-2xl bg-white border border-ink-100 shadow-card p-6 my-5">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h4 className="font-display text-xl tracking-tight !mt-0 !mb-0.5">
            {name}
          </h4>
          <p className="text-sm text-ink-500 !my-0">{area}</p>
        </div>
        <span className="text-sm font-semibold text-electric-600">
          {dayPass}
        </span>
      </div>
      <p className="text-sm text-ink-700 !my-3">{vibe}</p>
      <p className="text-xs text-ink-500 !my-0">
        <span className="font-semibold text-ink-700">Best for:</span> {bestFor}
      </p>
      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <div className="rounded-xl bg-sand-50 p-3">
          <div className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold mb-1">
            Pros
          </div>
          <ul className="text-sm text-ink-700 list-none !pl-0 space-y-1">
            {pros.map((p) => (
              <li
                key={p}
                className="!pl-0 before:hidden flex gap-2 items-start"
              >
                <span className="text-electric-600">+</span> {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-ink-100 p-3">
          <div className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold mb-1">
            Cons
          </div>
          <ul className="text-sm text-ink-700 list-none !pl-0 space-y-1">
            {cons.map((c) => (
              <li
                key={c}
                className="!pl-0 before:hidden flex gap-2 items-start"
              >
                <span className="text-sand-500">−</span> {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-electric-600 !no-underline hover:underline"
        >
          Visit site →
        </a>
      ) : null}
    </div>
  );
}
