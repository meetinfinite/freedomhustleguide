import Link from "next/link";

interface CTASectionProps {
  title: string;
  subtitle?: string;
  primaryHref?: string;
  primaryLabel?: string;
  /** Optional custom primary action (e.g. BuyButton). Overrides primaryHref/Label when set. */
  primaryAction?: React.ReactNode;
  secondaryHref?: string;
  secondaryLabel?: string;
  variant?: "dark" | "light";
}

export function CTASection({
  title,
  subtitle,
  primaryHref,
  primaryLabel,
  primaryAction,
  secondaryHref,
  secondaryLabel,
  variant = "dark"
}: CTASectionProps) {
  const dark = variant === "dark";
  return (
    <div className="max-w-6xl mx-auto px-6 my-10">
      <section
        className={`rounded-3xl overflow-hidden ${
          dark ? "bg-ink-900 text-sand-50" : "bg-white border border-ink-100"
        }`}
      >
        <div className="px-8 py-12 sm:py-16 sm:px-14 text-center max-w-3xl mx-auto">
        <h3
          className={`font-display text-3xl sm:text-4xl tracking-tight !mt-0 !mb-3 ${
            dark ? "text-sand-50" : "text-ink-900"
          }`}
        >
          {title}
        </h3>
        {subtitle ? (
          <p
            className={`text-base sm:text-lg leading-relaxed ${
              dark ? "text-sand-200" : "text-ink-600"
            }`}
          >
            {subtitle}
          </p>
        ) : null}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {primaryAction ? (
            primaryAction
          ) : primaryHref && primaryLabel ? (
            <Link
              href={primaryHref}
              className={`px-6 py-3 rounded-full font-medium transition ${
                dark
                  ? "bg-sand-50 text-ink-900 hover:bg-white"
                  : "bg-ink-900 text-sand-50 hover:bg-ink-700"
              }`}
            >
              {primaryLabel}
            </Link>
          ) : null}
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className={`px-6 py-3 rounded-full font-medium transition border ${
                dark
                  ? "border-sand-200/30 text-sand-50 hover:border-sand-50"
                  : "border-ink-200 text-ink-900 hover:border-ink-400"
              }`}
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
        </div>
      </section>
    </div>
  );
}
