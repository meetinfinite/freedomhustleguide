"use client";

import { useEffect, useState } from "react";

interface BuyButtonProps {
  /** "lifetime" or a guide slug like "bangkok" */
  product: string;
  /** Path the buyer returns to after Stripe Checkout (success or cancel) */
  returnPath?: string;
  /** Pre-fill the email on Stripe Checkout (use when buyer is already signed in) */
  customerEmail?: string;
  children: React.ReactNode;
  className?: string;
}

export function BuyButton({
  product,
  returnPath,
  customerEmail,
  children,
  className = ""
}: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset loading if the browser restored us via back/forward cache (bfcache),
  // e.g. when the user hit Back from Stripe. Otherwise the button stays "Loading…".
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) {
        setLoading(false);
        setError(null);
      }
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, returnPath, customerEmail })
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Could not start checkout. Try again.");
        setLoading(false);
        return;
      }
      // Hand off to Stripe-hosted checkout page
      window.location.href = data.url;
    } catch {
      setError("Network error. Try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className={`${className} disabled:opacity-60 disabled:cursor-wait`}
      >
        {loading ? "Loading…" : children}
      </button>
      {error ? (
        <p className="text-xs text-rose-600 mt-2">{error}</p>
      ) : null}
    </>
  );
}
