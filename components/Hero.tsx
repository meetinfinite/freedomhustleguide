import Link from "next/link";
import type { GuideMeta } from "@/lib/guides";

interface HeroProps {
  guide: GuideMeta;
  primaryHref?: string;
  primaryLabel?: string;
  /** Optional custom primary action (e.g. a BuyButton). Overrides primaryHref/Label when set. */
  primaryAction?: React.ReactNode;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function Hero({
  guide,
  primaryHref,
  primaryLabel,
  primaryAction,
  secondaryHref,
  secondaryLabel
}: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={
          guide.heroImage
            ? { backgroundImage: `url(${guide.heroImage})` }
            : undefined
        }
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/40 via-ink-900/60 to-ink-900/95" />
      <div className="absolute inset-0 bg-hero-grad opacity-50" />

      <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-24 sm:pt-32 sm:pb-32">
        <div className="max-w-3xl fade-up">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-sand-200 font-semibold mb-5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15">
            <span>Freedom Hustle Guide to&hellip;</span>
          </div>
          <h1 className="font-display text-5xl sm:text-7xl leading-[1.02] tracking-tight text-sand-50">
            <span className="mr-3">{guide.flag}</span>
            {guide.city}, {guide.country}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-sand-100/90 max-w-2xl leading-relaxed">
            {guide.tagline}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            {primaryAction ? (
              primaryAction
            ) : primaryHref && primaryLabel ? (
              <Link
                href={primaryHref}
                className="px-6 py-3 rounded-full bg-sand-50 text-ink-900 font-medium hover:bg-white transition"
              >
                {primaryLabel}
              </Link>
            ) : null}
            {secondaryHref && secondaryLabel ? (
              <Link
                href={secondaryHref}
                className="px-6 py-3 rounded-full border border-sand-50/30 text-sand-50 font-medium hover:border-sand-50 transition"
              >
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>

        {guide.quickStats.length ? (
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-5xl">
            {guide.quickStats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-white/10 backdrop-blur border border-white/15 p-4"
              >
                <p className="text-[11px] uppercase tracking-wider text-sand-200 font-semibold">
                  {s.label}
                </p>
                <p className="text-sand-50 font-semibold text-sm sm:text-base mt-1">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
