"use client";

import { useEffect, useState } from "react";

interface SpecialOfferBannerProps {
  /** Pre-fill Stripe email when buyer is already signed in */
  customerEmail?: string;
}

/**
 * Full-width promo banner that sits above the sticky header.
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
      aria-label="Launch offer — Lifetime access for £79 with code FREEDOM, save 74%"
      className="group block w-full bg-ink-900 text-sand-50 py-2.5 px-4 text-[13px] sm:text-sm hover:bg-ink-800 active:bg-ink-700 transition cursor-pointer disabled:opacity-70 disabled:cursor-wait relative overflow-hidden"
    >
      {/* Subtle terracotta glow behind content */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-[60%] max-w-[640px] bg-gradient-to-r from-transparent via-electric-500/15 to-transparent blur-2xl"
      />

      <div className="relative font-display flex items-center justify-center gap-x-2.5 gap-y-1 flex-wrap leading-tight text-[15px] sm:text-base tracking-tight">
        {/* Pulsing dot */}
        <span aria-hidden className="relative inline-flex w-2 h-2 shrink-0">
          <span className="absolute inset-0 rounded-full bg-electric-400 opacity-75 animate-ping" />
          <span className="relative inline-flex w-2 h-2 rounded-full bg-electric-500" />
        </span>

        <span className="uppercase text-sand-50">All guides. Forever.</span>

        <span className="text-sand-400/70 line-through">£299</span>
        <span className="font-bold text-sand-50">£79</span>

        <span className="hidden sm:inline text-sand-300/80">
          with code{" "}
          <span className="font-bold text-sand-50">FREEDOM</span>
        </span>

        {/* The one accent */}
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-electric-500 text-white font-bold uppercase text-[12px] sm:text-[13px]">
          Save 74%
        </span>

        <span
          aria-hidden
          className="text-sand-50 transition-transform duration-200 group-hover:translate-x-1"
        >
          →
        </span>
      </div>
    </button>
  );
}
