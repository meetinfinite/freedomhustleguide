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
      aria-label="Launch offer — Lifetime access for £79, save 38%"
      className="group block w-full bg-ink-900 text-sand-50 py-2.5 px-4 text-[13px] sm:text-sm hover:bg-ink-800 active:bg-ink-700 transition cursor-pointer disabled:opacity-70 disabled:cursor-wait relative overflow-hidden"
    >
      {/* Subtle terracotta glow behind content */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-[60%] max-w-[640px] bg-gradient-to-r from-transparent via-electric-500/15 to-transparent blur-2xl"
      />

      <div className="relative flex items-center justify-center gap-x-3 gap-y-1 flex-wrap leading-tight text-sand-50">
        {/* Pulsing dot */}
        <span aria-hidden className="relative inline-flex w-2 h-2 shrink-0">
          <span className="absolute inset-0 rounded-full bg-electric-400 opacity-75 animate-ping" />
          <span className="relative inline-flex w-2 h-2 rounded-full bg-electric-500" />
        </span>

        <span className="font-display tracking-tight text-[15px] sm:text-base uppercase">
          All guides. Forever.{" "}
          <span className="text-ink-400 line-through normal-case">£129</span>{" "}
          £79
        </span>

        {/* Pill badge — the one element allowed to stand out */}
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-electric-500 text-white text-[11px] font-bold tracking-wider uppercase">
          Save 38%
        </span>

        <span
          aria-hidden
          className="transition-transform duration-200 group-hover:translate-x-1"
        >
          →
        </span>
      </div>
    </button>
  );
}
