interface MapPlaceholderProps {
  label?: string;
  caption?: string;
}

export function MapPlaceholder({
  label = "Map view",
  caption = "Pin map of every spot in this section"
}: MapPlaceholderProps) {
  return (
    <div className="rounded-3xl border border-ink-100 bg-white shadow-card overflow-hidden my-6">
      <div className="relative aspect-[16/9] bg-sand-grad">
        {/* faux map grid */}
        <div className="absolute inset-0 opacity-40">
          <svg viewBox="0 0 400 225" className="w-full h-full">
            <defs>
              <pattern
                id="grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="#d4ba85"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <path
              d="M0,150 Q120,80 220,140 T400,90"
              stroke="#2563ff"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
          </svg>
        </div>
        {/* fake pins */}
        <div className="absolute left-[20%] top-[40%] w-3 h-3 rounded-full bg-electric-500 ring-4 ring-electric-100" />
        <div className="absolute left-[55%] top-[60%] w-3 h-3 rounded-full bg-electric-500 ring-4 ring-electric-100" />
        <div className="absolute left-[75%] top-[35%] w-3 h-3 rounded-full bg-electric-500 ring-4 ring-electric-100" />
        <div className="absolute left-[35%] top-[70%] w-3 h-3 rounded-full bg-electric-500 ring-4 ring-electric-100" />

        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-white/90 text-xs font-semibold text-ink-700 shadow-card">
          {label}
        </div>
      </div>
      <div className="p-4 text-center text-sm text-ink-500">{caption}</div>
    </div>
  );
}
