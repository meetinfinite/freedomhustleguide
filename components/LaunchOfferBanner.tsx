import Link from "next/link";

/**
 * Promo strip: every guide is pay what you want (£0 included).
 * Replaced the "Bangkok free with code LAUNCH" strip on 2026-09-22 - the
 * pay-what-you-want picker (components/PayWhatYouWant.tsx) has no code
 * field, so the LAUNCH code is no longer needed.
 */
export function LaunchOfferBanner() {
  return (
    <Link
      href="/#guides"
      aria-label="Every guide is pay what you want - even £0"
      className="group block w-full bg-emerald-900 text-white py-2.5 px-4 text-[13px] sm:text-sm hover:bg-emerald-950 active:bg-black transition relative overflow-hidden !no-underline"
    >
      <div className="relative flex items-center justify-center gap-x-1.5 gap-y-1 sm:gap-x-2.5 flex-wrap leading-tight text-[13px] sm:text-sm">
        <span aria-hidden className="text-base leading-none">
          🧡
        </span>

        <span className="uppercase text-white tracking-wide font-semibold">
          Pay what you want
        </span>

        <span className="text-white/80">
          Every guide, <span className="font-bold text-white">even £0</span>
        </span>

        <span
          aria-hidden
          className="hidden sm:inline text-white/70 group-hover:translate-x-0.5 transition"
        >
          →
        </span>
      </div>
    </Link>
  );
}
