interface ProTipProps {
  children: React.ReactNode;
  label?: string;
}

export function ProTip({ children, label = "Pro tip" }: ProTipProps) {
  return (
    <div className="rounded-2xl border border-electric-100 bg-electric-50 p-5 my-5 flex gap-4 items-start">
      <div className="w-9 h-9 rounded-xl bg-electric-500 text-white grid place-items-center text-base shrink-0 font-bold">
        ✦
      </div>
      <div className="flex-1">
        <div className="text-[11px] uppercase tracking-wider text-electric-700 font-semibold !my-0">
          {label}
        </div>
        <div className="text-sm text-ink-800 leading-relaxed mt-1 [&>p]:!my-1">
          {children}
        </div>
      </div>
    </div>
  );
}
