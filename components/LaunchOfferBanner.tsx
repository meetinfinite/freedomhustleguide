import Link from "next/link";

/**
 * Launch-week promo strip: the Bangkok guide free with code LAUNCH.
 * The Stripe promotion code (100% off, Bangkok product only) expires
 * 31 Aug 2026 23:59 UTC - LAUNCH_OFFER_ENDS matches it so the banner
 * takes itself down when the code stops working.
 */
const LAUNCH_OFFER_ENDS = Date.UTC(2026, 7, 31, 23, 59, 59);

export function LaunchOfferBanner() {
  if (Date.now() > LAUNCH_OFFER_ENDS) return null;

  return (
    <Link
      href="/guides/bangkok"
      aria-label="Launch offer - the Bangkok guide free with code LAUNCH until 31 August"
      className="group block w-full bg-emerald-900 text-white py-2.5 px-4 text-[13px] sm:text-sm hover:bg-emerald-950 active:bg-black transition relative overflow-hidden !no-underline"
    >
      <div className="relative flex items-center justify-center gap-x-1.5 gap-y-1 sm:gap-x-2.5 flex-wrap leading-tight text-[13px] sm:text-sm">
        <span aria-hidden className="text-base leading-none">
          🎉
        </span>

        <span className="uppercase text-white tracking-wide font-semibold">
          Launch week
        </span>

        <span className="text-white/90">The Bangkok guide</span>
        <span className="text-white/60 line-through">£5.99</span>
        <span className="font-bold text-white">FREE</span>

        <span className="text-white/60">
          with code <span className="font-bold text-white">LAUNCH</span>{" "}
          · until 31 Aug
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
