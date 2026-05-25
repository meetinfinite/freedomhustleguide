"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Status = "idle" | "submitting" | "ok" | "already" | "error";

/**
 * Footer newsletter signup as a button-triggered modal. Keeps the footer
 * itself uncluttered. Posts to /api/notify with a sentinel "Newsletter"
 * city so we can distinguish general signups from city-specific waitlist
 * entries in Supabase.
 */
export function FooterSubscribe() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape + lock body scroll while modal open
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          city: "Newsletter",
          source:
            typeof window !== "undefined" ? window.location.pathname : null
        })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        setStatus("error");
        return;
      }
      setStatus(data.alreadySubscribed ? "already" : "ok");
    } catch {
      setErrorMsg("Network error. Try again.");
      setStatus("error");
    }
  }

  function reset() {
    setOpen(false);
    setTimeout(() => {
      setStatus("idle");
      setEmail("");
      setErrorMsg(null);
    }, 200);
  }

  const modal = open ? (
    <div
      className="fixed inset-0 z-[60] grid place-items-center p-5 bg-ink-900/60 backdrop-blur-sm"
      onClick={reset}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscribe-title"
        className="w-full max-w-md rounded-3xl bg-white shadow-pop p-6 sm:p-8 fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {status === "ok" || status === "already" ? (
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-electric-50 text-electric-600 grid place-items-center mb-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-6 h-6"
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
            <h3
              id="subscribe-title"
              className="font-display text-2xl tracking-tight"
            >
              {status === "already"
                ? "You're already on the list."
                : "You're in."}
            </h3>
            <p className="text-ink-600 mt-2 leading-relaxed">
              {status === "already"
                ? "Thanks — we'll only email you when we have something genuinely worth saying."
                : "We'll only email you when we have something genuinely worth saying."}
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 w-full px-5 py-3 rounded-full bg-ink-900 text-sand-50 font-medium hover:bg-ink-700 transition"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="text-[11px] uppercase tracking-[0.18em] text-electric-600 font-semibold">
              Newsletter
            </p>
            <h3
              id="subscribe-title"
              className="font-display text-3xl tracking-tight mt-1"
            >
              Stay in the loop.
            </h3>
            <p className="text-ink-600 mt-2 leading-relaxed">
              New city drops, travel finds, the occasional founders
              discount. No spam, no fluff — only when there&apos;s something
              genuinely worth sending.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-3">
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-ink-500 font-semibold">
                  Email
                </span>
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-ink-200 bg-white focus:border-electric-500 focus:outline-none focus:ring-4 focus:ring-electric-100 transition"
                />
              </label>

              {errorMsg ? (
                <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3">
                  {errorMsg}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full px-5 py-3 rounded-full bg-ink-900 text-sand-50 font-semibold hover:bg-ink-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {status === "submitting" ? "Adding you…" : "Subscribe"}
              </button>
            </form>

            <p className="mt-4 text-xs text-ink-400 text-center">
              Unsubscribe anytime. We don&apos;t share your email — ever.
            </p>
          </>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ink-900 text-sand-50 text-sm font-semibold hover:bg-ink-700 transition"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="w-4 h-4"
          aria-hidden
        >
          <path d="M4 6h16v12H4z" />
          <path d="M4 6l8 7 8-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Subscribe to newsletter
      </button>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
