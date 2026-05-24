interface CafeCardProps {
  name: string;
  area: string;
  wifi: "Excellent" | "Good" | "Patchy";
  plugs: "Plenty" | "Some" | "Rare";
  noise: "Quiet" | "Moderate" | "Loud";
  comfort: string;
  bestTime: string;
  calls: "Yes" | "Risky" | "No";
  price: "$" | "$$" | "$$$";
  mapLink?: string;
  tags?: string[];
}

const PILL: Record<string, string> = {
  Excellent: "bg-electric-50 text-electric-700",
  Good: "bg-sand-100 text-sand-500",
  Patchy: "bg-rose-50 text-rose-600",
  Plenty: "bg-electric-50 text-electric-700",
  Some: "bg-sand-100 text-sand-500",
  Rare: "bg-rose-50 text-rose-600",
  Quiet: "bg-electric-50 text-electric-700",
  Moderate: "bg-sand-100 text-sand-500",
  Loud: "bg-rose-50 text-rose-600",
  Yes: "bg-electric-50 text-electric-700",
  Risky: "bg-sand-100 text-sand-500",
  No: "bg-rose-50 text-rose-600"
};

export function CafeCard({
  name,
  area,
  wifi,
  plugs,
  noise,
  comfort,
  bestTime,
  calls,
  price,
  mapLink,
  tags = []
}: CafeCardProps) {
  return (
    <div className="rounded-2xl bg-white border border-ink-100 shadow-card p-6 my-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-display text-xl tracking-tight !mt-0 !mb-0.5">
            {name}
          </h4>
          <p className="text-sm text-ink-500 !my-0">{area}</p>
        </div>
        <span className="text-sm font-semibold text-ink-700">{price}</span>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <Pill label={`WiFi: ${wifi}`} cls={PILL[wifi]} />
        <Pill label={`Plugs: ${plugs}`} cls={PILL[plugs]} />
        <Pill label={`Noise: ${noise}`} cls={PILL[noise]} />
        <Pill label={`Calls: ${calls}`} cls={PILL[calls]} />
      </div>

      <p className="text-sm text-ink-600 mt-4 !my-3">{comfort}</p>
      <p className="text-xs text-ink-500 !my-0">
        <span className="font-semibold text-ink-700">Best time:</span> {bestTime}
      </p>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-4">
          {tags.map((t) => (
            <span
              key={t}
              className="text-xs text-ink-600 px-2.5 py-1 rounded-full bg-sand-50 border border-sand-100"
            >
              #{t}
            </span>
          ))}
        </div>
      ) : null}

      {mapLink ? (
        <a
          href={mapLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-electric-600 hover:underline !no-underline"
        >
          Open in Maps →
        </a>
      ) : null}
    </div>
  );
}

function Pill({ label, cls }: { label: string; cls?: string }) {
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
        cls || "bg-ink-100 text-ink-700"
      }`}
    >
      {label}
    </span>
  );
}
