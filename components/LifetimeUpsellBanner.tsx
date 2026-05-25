"use client";

import { BuyButton } from "./BuyButton";

interface LifetimeUpsellBannerProps {
  userEmail: string;
  /** Where to return after Stripe Checkout (defaults to current page) */
  returnPath?: string;
}

/**
 * Premium dark banner that nudges single-guide buyers toward lifetime.
 * Renders nothing for lifetime members — show conditionally in the parent.
 */
export function LifetimeUpsellBanner({
  userEmail,
  returnPath = "/my"
}: LifetimeUpsellBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-ink-900 text-sand-50 p-6 sm:p-7 mb-10 shadow-pop">
      <div className="absolute inset-0 bg-hero-grad opacity-50 pointer-events-none" />
      <div className="relative grid sm:grid-cols-[1fr_auto] gap-5 items-center">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-electric-300 font-semibold mb-1">
            Members upgrade
          </p>
          <h3 className="font-display text-xl sm:text-2xl tracking-tight !mt-0 !mb-1">
            Unlock every guide.{" "}
            <span className="text-sand-300/80 line-through">£299</span>{" "}
            <span className="text-sand-50">£79</span>
          </h3>
          <p className="text-sand-200/90 text-sm leading-snug">
            All current cities + every future one. One purchase, no re-buys.
            Use code{" "}
            <span className="font-bold tracking-wider text-electric-300">
              FREEDOM
            </span>{" "}
            at checkout.
          </p>
        </div>
        <div className="shrink-0 self-end sm:self-center">
          <BuyButton
            product="lifetime"
            returnPath={returnPath}
            customerEmail={userEmail}
            className="px-5 py-2.5 rounded-full bg-sand-50 text-ink-900 font-semibold text-sm hover:bg-white transition shadow-card whitespace-nowrap"
          >
            Get Lifetime →
          </BuyButton>
        </div>
      </div>
    </div>
  );
}
