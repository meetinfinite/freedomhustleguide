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
      className="group block w-full bg-emerald-900 text-white py-2.5 px-4 text-[13px] sm:text-sm hover:bg-emerald-950 active:bg-black transition cursor-pointer disabled:opacity-70 disabled:cursor-wait relative overflow-hidden"
    >
      <div className="relative flex items-center justify-center gap-x-2.5 gap-y-1 flex-wrap leading-tight text-[13px] sm:text-sm">
        {/* Pulsing dot */}
        <span aria-hidden className="relative inline-flex w-2 h-2 shrink-0">
          <span className="absolute inset-0 rounded-full bg-white opacity-75 animate-ping" />
          <span className="relative inline-flex w-2 h-2 rounded-full bg-white" />
        </span>

        <span className="uppercase text-white tracking-wide font-semibold">
          All guides. Forever.
        </span>

        <span className="text-white/60 line-through">£299</span>
        <span className="font-bold text-white">£79</span>

        <span className="hidden sm:inline text-white/60">
          with code{" "}
          <span className="font-bold text-white">FREEDOM</span>
        </span>

        {/* The one accent — black pill, white text */}
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-ink-900 text-white font-bold uppercase text-[11px] sm:text-[12px] tracking-wider">
          Save 74%
        </span>

        <span
          aria-hidden
          className="text-white transition-transform duration-200 group-hover:translate-x-1"
        >
          →
        </span>
      </div>
    </button>
  );
}
