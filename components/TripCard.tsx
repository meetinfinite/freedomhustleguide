interface TripCardProps {
  name: string;
  bestFor: string;
  timeNeeded: string;
  cost: string;
  worthIt: "Yes" | "Maybe" | "Skip";
  notes: string;
  bookingLink?: string;
}

const VERDICT: Record<TripCardProps["worthIt"], string> = {
  Yes: "bg-electric-50 text-electric-700",
  Maybe: "bg-sand-100 text-sand-500",
  Skip: "bg-rose-50 text-rose-600"
};

export function TripCard({
  name,
  bestFor,
  timeNeeded,
  cost,
  worthIt,
  notes,
  bookingLink
}: TripCardProps) {
  return (
    <div className="rounded-2xl bg-white border border-ink-100 shadow-card p-6 my-5">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-display text-xl tracking-tight !mt-0 !mb-0">
          {name}
        </h4>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${VERDICT[worthIt]}`}
        >
          {worthIt === "Yes"
            ? "Worth it"
            : worthIt === "Maybe"
              ? "Depends"
              : "Skip it"}
        </span>
      </div>
      <div className="grid sm:grid-cols-3 gap-3 mt-4 text-sm">
        <Meta label="Best for" value={bestFor} />
        <Meta label="Time" value={timeNeeded} />
        <Meta label="Cost" value={cost} />
      </div>
      <p className="text-sm text-ink-700 !my-3">{notes}</p>
      {bookingLink ? (
        <a
          href={bookingLink}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-electric-600 !no-underline hover:underline"
        >
          Book / details →
        </a>
      ) : null}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">
        {label}
      </div>
      <div className="text-ink-900 font-medium">{value}</div>
    </div>
  );
}
