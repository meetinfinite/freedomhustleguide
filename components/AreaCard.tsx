interface AreaCardProps {
  name: string;
  vibe: string;
  bestFor: string;
  rent: string;
  pros: string[];
  cons: string[];
  transport: string;
  workScene: string;
  score: number;
  tags?: string[];
}

export function AreaCard({
  name,
  vibe,
  bestFor,
  rent,
  pros,
  cons,
  transport,
  workScene,
  score,
  tags = []
}: AreaCardProps) {
  return (
    <div className="rounded-3xl bg-white border border-ink-100 shadow-card p-7 my-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="font-display text-2xl tracking-tight text-ink-900 !mt-0 !mb-1">
            {name}
          </h3>
          <p className="text-sm text-ink-500">{vibe}</p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xs uppercase tracking-wider text-ink-400 font-semibold">
            Nomad score
          </div>
          <div className="font-display text-3xl text-electric-600 leading-none">
            {score}
            <span className="text-base text-ink-400">/10</span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 my-5 text-sm">
        <Row label="Best for" value={bestFor} />
        <Row label="Rent / month" value={rent} />
        <Row label="Transport" value={transport} />
        <Row label="Work scene" value={workScene} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <div className="rounded-xl bg-sand-50 p-4">
          <div className="text-xs uppercase tracking-wider text-ink-500 font-semibold mb-2">
            Pros
          </div>
          <ul className="space-y-1 text-sm text-ink-700 list-none !pl-0">
            {pros.map((p) => (
              <li key={p} className="!pl-0 before:hidden flex gap-2">
                <span className="text-electric-600">+</span> {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-ink-50 bg-opacity-50 p-4 border border-ink-100">
          <div className="text-xs uppercase tracking-wider text-ink-500 font-semibold mb-2">
            Cons
          </div>
          <ul className="space-y-1 text-sm text-ink-700 list-none !pl-0">
            {cons.map((c) => (
              <li key={c} className="!pl-0 before:hidden flex gap-2">
                <span className="text-sand-500">−</span> {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-5">
          {tags.map((t) => (
            <span
              key={t}
              className="text-xs font-medium text-ink-600 px-3 py-1 rounded-full bg-sand-100"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wider text-ink-400 font-semibold">
        {label}
      </span>
      <span className="text-ink-900 font-medium">{value}</span>
    </div>
  );
}
