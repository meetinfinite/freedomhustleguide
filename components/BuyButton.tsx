"use client";

import { useState } from "react";

interface BuyButtonProps {
  /** "lifetime" or a guide slug like "bangkok" */
  product: string;
  /** Path the buyer returns to after Stripe Checkout (success or cancel) */
  returnPath?: string;
  children: React.ReactNode;
  className?: string;
}

export function BuyButton({
  product,
  returnPath,
  children,
  className = ""
}: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, returnPath })
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
