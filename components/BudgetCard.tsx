interface BudgetLine {
  label: string;
  amount: string;
}

interface BudgetCardProps {
  tier: "Budget" | "Comfortable" | "Premium";
  total: string;
  description: string;
  lines: BudgetLine[];
  highlight?: boolean;
}

const TIER_STYLES: Record<
  BudgetCardProps["tier"],
  { badge: string; accent: string }
> = {
  Budget: { badge: "bg-sand-100 text-sand-500", accent: "text-sand-500" },
  Comfortable: {
    badge: "bg-electric-50 text-electric-700",
    accent: "text-electric-600"
  },
  Premium: { badge: "bg-ink-900 text-sand-50", accent: "text-ink-900" }
};

export function BudgetCard({
  tier,
  total,
  description,
  lines,
  highlight = false
}: BudgetCardProps) {
  const style = TIER_STYLES[tier];
  return (
    <div
      className={`rounded-3xl p-7 border my-6 ${
        highlight
          ? "bg-ink-900 text-sand-50 border-ink-900 shadow-pop"
          : "bg-white border-ink-100 shadow-card"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            highlight ? "bg-sand-50 text-ink-900" : style.badge
          }`}
        >
          {tier} Nomad
        </span>
      </div>
      <div className="flex items-baseline gap-2 mt-3">
        <span
          className={`font-display text-4xl tracking-tight ${
            highlight ? "text-sand-50" : style.accent
          }`}
        >
          {total}
        </span>
        <span
          className={`text-sm ${highlight ? "text-sand-200" : "text-ink-500"}`}
        >
          / month
        </span>
      </div>
      <p
        className={`mt-2 text-sm ${
          highlight ? "text-sand-200" : "text-ink-600"
        }`}
      >
        {description}
      </p>
      <ul
        className={`mt-5 space-y-2 text-sm list-none !pl-0 ${
          highlight ? "text-sand-100" : "text-ink-700"
        }`}
      >
        {lines.map((l) => (
          <li
            key={l.label}
            className="flex items-center justify-between !pl-0 before:hidden border-b border-opacity-10 border-current pb-2 last:border-0"
          >
            <span>{l.label}</span>
            <span className="font-medium">{l.amount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
