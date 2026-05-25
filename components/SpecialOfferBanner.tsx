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

      <div className="relative flex items-center justify-center gap-x-3 gap-y-1 flex-wrap leading-tight">
        {/* Pulsing dot */}
        <span aria-hidden className="relative inline-flex w-2 h-2 shrink-0">
          <span className="absolute inset-0 rounded-full bg-electric-400 opacity-75 animate-ping" />
          <span className="relative inline-flex w-2 h-2 rounded-full bg-electric-500" />
        </span>

        {/* Small uppercase label */}
        <span className="text-[11px] uppercase tracking-[0.18em] text-sand-300 font-semibold">
          Lifetime
        </span>

        {/* Strikethrough old + bold new price — the visual anchor */}
        <span className="flex items-baseline gap-2">
          <span className="text-sand-400/70 line-through text-[13px]">
            £299
          </span>
          <span className="text-sand-50 font-bold text-[17px] sm:text-lg tracking-tight">
            £79
          </span>
        </span>

        {/* Pill = the code. Everything else points here. */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-electric-500 text-white text-[11px] font-bold tracking-[0.12em]">
          <span className="opacity-80">CODE</span>
          <span>FREEDOM</span>
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
