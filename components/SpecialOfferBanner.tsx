"use client";

import { useEffect, useState } from "react";

interface SpecialOfferBannerProps {
  /** Pre-fill Stripe email when buyer is already signed in */
  customerEmail?: string;
}

/**
 * Full-width black promo banner that sits above the sticky header.
 * Clicking it opens Stripe Checkout for the lifetime product directly.
 *
 * Hidden for lifetime members (controlled by parent page).
 */
export function SpecialOfferBanner({ customerEmail }: SpecialOfferBannerProps) {
  const [loading, setLoading] = useState(false);

  // Reset on bfcache restore (back button from Stripe)
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) setLoading(false);
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  async function onClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: "lifetime",
          returnPath:
            typeof window !== "undefined" ? window.location.pathname : "/",
          customerEmail
        })
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label="Special launch offer — Lifetime access for £79"
      className="block w-full bg-ink-900 text-sand-50 py-3 px-4 text-[13px] sm:text-sm hover:bg-ink-800 active:bg-ink-700 transition cursor-pointer disabled:opacity-70 disabled:cursor-wait"
    >
      <div className="flex items-center justify-center gap-x-2 gap-y-1 flex-wrap leading-tight">
        <span className="text-base leading-none">🎉</span>
        <span className="hidden sm:inline font-bold tracking-wide">
          LAUNCH OFFER
        </span>
        <span className="hidden sm:inline text-sand-400/70">·</span>
        <span className="hidden sm:inline">Lifetime access</span>
        <span className="text-sand-400/80 line-through">£129</span>
        <span className="font-bold text-[15px] sm:text-base">£79</span>
        <span className="sm:hidden text-sand-200">Lifetime</span>
        <span className="text-sand-400/70">·</span>
        <span className="text-electric-300 font-semibold">Save 38%</span>
        <span className="ml-0.5 text-base leading-none">→</span>
      </div>
    </button>
  );
}
