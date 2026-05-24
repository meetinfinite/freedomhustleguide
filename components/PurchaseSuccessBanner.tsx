"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Shows a fullscreen overlay after Stripe Checkout success, telling the buyer
 * to check their email for the sign-in link. Closes itself when dismissed.
 * Triggers off ?purchase=success in the URL — same param Stripe redirects to.
 */
export function PurchaseSuccessBanner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(searchParams.get("purchase") === "success");
  }, [searchParams]);

  function dismiss() {
    setOpen(false);
    // Strip the query params so the banner doesn't reappear on refresh
    router.replace(window.location.pathname, { scroll: false });
  }

  // Esc to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center p-5 bg-ink-900/70 backdrop-blur-sm"
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-success-title"
        className="w-full max-w-md rounded-3xl bg-white shadow-pop p-7 sm:p-9 fade-up text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 mx-auto rounded-full bg-electric-50 text-electric-600 grid place-items-center mb-5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-7 h-7"
            aria-hidden
          >
            <path
              d="M5 13l4 4 10-10"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2
          id="purchase-success-title"
          className="font-display text-3xl sm:text-4xl tracking-tight text-ink-900"
        >
          You're in.
        </h2>
        <p className="text-ink-600 mt-3 leading-relaxed">
          Payment received. We've just emailed you a one-tap sign-in link —
          click it to open your guide.
        </p>

        <div className="rounded-2xl bg-sand-50 p-4 mt-6 text-left text-sm text-ink-700 leading-relaxed">
          <p className="font-semibold text-ink-900 !mt-0 !mb-1">
            Can't see the email?
          </p>
          <ul className="list-disc pl-5 space-y-1 !my-0">
            <li>Check spam — first emails sometimes land there.</li>
            <li>
              It comes from <code>noreply@freedomhustleguide.com</code>.
            </li>
            <li>Look for "Confirm your email" or "Sign in".</li>
          </ul>
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="mt-6 w-full px-5 py-3 rounded-full bg-ink-900 text-sand-50 font-semibold hover:bg-ink-700 transition"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
