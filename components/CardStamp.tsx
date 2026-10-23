/**
 * Round, slightly rotated stamp in the corner of a card. "Our pick" when
 * the editor writes "(our pick)" in Notion; "PR stay" when they write
 * "(PR stay)" - a stay we were hosted at, which UK advertising rules say
 * we must disclose (Valeria, 2026-10-23). PR wins if both are written.
 */
export function CardStamp({ pr }: { pr?: boolean }) {
  return (
    <div
      className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-electric-500 text-white flex items-center justify-center text-center font-display tracking-tight shadow-card rotate-[-8deg]"
      style={{ lineHeight: 1.05 }}
      aria-label={pr ? "PR stay" : "Our pick"}
    >
      {pr ? (
        // The disclosure word gets the big type
        <div>
          <div className="!text-[18px] sm:!text-[22px] font-semibold !leading-none">
            PR
          </div>
          <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] font-semibold opacity-90 mt-1">
            Stay
          </div>
        </div>
      ) : (
        <div>
          <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] font-semibold opacity-90">
            Our
          </div>
          <div className="!text-[18px] sm:!text-[22px] font-semibold !leading-none mt-0.5">
            Pick
          </div>
        </div>
      )}
      {/* Subtle stitched-stamp ring */}
      <div className="absolute inset-1.5 rounded-full border border-white/30 pointer-events-none" />
    </div>
  );
}
