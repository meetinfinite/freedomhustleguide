interface GymCardProps {
  name: string;
  type: "Commercial" | "Muay Thai" | "Yoga" | "Wellness" | "Condo";
  area?: string;
  price: string;
  notes: string;
  link?: string;
}

const TYPE_COLORS: Record<GymCardProps["type"], string> = {
  Commercial: "bg-electric-50 text-electric-700",
  "Muay Thai": "bg-rose-50 text-rose-600",
  Yoga: "bg-sand-100 text-sand-500",
  Wellness: "bg-sand-100 text-sand-500",
  Condo: "bg-ink-100 text-ink-700"
};

export function GymCard({
  name,
  type,
  area,
  price,
  notes,
  link
}: GymCardProps) {
  return (
    <div className="rounded-2xl bg-white border border-ink-100 shadow-card p-6 my-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-display text-lg tracking-tight !mt-0 !mb-0.5">
            {name}
          </h4>
          {area ? (
            <p className="text-sm text-ink-500 !my-0">{area}</p>
          ) : null}
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_COLORS[type]}`}
        >
          {type}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-sm font-semibold text-electric-600">{price}</span>
      </div>
      <p className="text-sm text-ink-700 !my-3">{notes}</p>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-electric-600 !no-underline hover:underline"
        >
          More info →
        </a>
      ) : null}
    </div>
  );
}
