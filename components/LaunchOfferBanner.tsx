import Link from "next/link";

/**
 * Evergreen promo strip: the Bangkok guide free with code LAUNCH.
 * The Stripe promotion code (100% off, Bangkok product only) has no
 * expiry since 2026-09-02 (Valeria's call) - to end the offer, archive
 * the code in Stripe AND remove this banner's mounts on the homepage
 * and guide landing pages.
 * £5.99 struck through is the genuine list price (golden rule 0).
 */
export function LaunchOfferBanner() {
  return (
    <Link
      href="/guides/bangkok"
      aria-label="The Bangkok guide free with code LAUNCH"
      className="group block w-full bg-emerald-900 text-white py-2.5 px-4 text-[13px] sm:text-sm hover:bg-emerald-950 active:bg-black transition relative overflow-hidden !no-underline"
    >
      <div className="relative flex items-center justify-center gap-x-1.5 gap-y-1 sm:gap-x-2.5 flex-wrap leading-tight text-[13px] sm:text-sm">
        <span aria-hidden className="text-base leading-none">
          🎉
        </span>

        <span className="uppercase text-white tracking-wide font-semibold">
          Free guide
        </span>

        <span className="text-white/90">The Bangkok guide</span>
        <span className="text-white/60 line-through">£5.99</span>
        <span className="font-bold text-white">FREE</span>

        <span className="text-white/60">
          with code <span className="font-bold text-white">LAUNCH</span> at
          checkout
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
