interface WarningCardProps {
  title: string;
  children: React.ReactNode;
  severity?: "warn" | "danger" | "info";
}

const STYLE: Record<
  NonNullable<WarningCardProps["severity"]>,
  { bg: string; border: string; icon: string; iconBg: string }
> = {
  warn: {
    bg: "bg-sand-50",
    border: "border-sand-200",
    icon: "⚠️",
    iconBg: "bg-sand-100"
  },
  danger: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    icon: "⛔",
    iconBg: "bg-rose-100"
  },
  info: {
    bg: "bg-electric-50",
    border: "border-electric-100",
    icon: "ℹ️",
    iconBg: "bg-electric-100"
  }
};

export function WarningCard({
  title,
  children,
  severity = "warn"
}: WarningCardProps) {
  const s = STYLE[severity];
  return (
    <div
      className={`rounded-2xl border ${s.border} ${s.bg} p-5 my-5 flex gap-4 items-start`}
    >
      <div
        className={`w-10 h-10 rounded-xl ${s.iconBg} grid place-items-center text-xl shrink-0`}
      >
        {s.icon}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-ink-900 !mt-0 !mb-1 text-base">
          {title}
        </h4>
        <div className="text-sm text-ink-700 leading-relaxed [&>p]:!my-1">
          {children}
        </div>
      </div>
    </div>
  );
}
