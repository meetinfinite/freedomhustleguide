"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface NotifyButtonProps {
  city: string;
  /** Tailwind class for the trigger button. */
  className?: string;
}

type Status = "idle" | "submitting" | "ok" | "already" | "error";

// Custom DOM event so opening one NotifyButton closes any others.
const CLOSE_EVENT = "notify-button:close-others";

export function NotifyButton({ city, className = "" }: NotifyButtonProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Portal target only exists in the browser
  useEffect(() => {
    setMounted(true);
  }, []);

  // If another NotifyButton opens, close ours
  useEffect(() => {
    function onCloseOthers() {
      setOpen(false);
    }
    window.addEventListener(CLOSE_EVENT, onCloseOthers);
    return () => window.removeEventListener(CLOSE_EVENT, onCloseOthers);
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
    e.stopPropagation();
    setStatus("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, city })
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
    // delay state reset so the modal doesn't visually flicker on close
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
            aria-labelledby="notify-title"
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
                  id="notify-title"
                  className="font-display text-2xl tracking-tight"
                >
                  {status === "already"
                    ? `Already on the list for ${city}.`
                    : `You're on the list for ${city}.`}
                </h3>
                <p className="text-ink-600 mt-2 leading-relaxed">
                  We'll email you the second the {city} guide goes live —
                  usually a few weeks ahead of public launch with a small
                  founders discount.
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
                  Coming soon
                </p>
                <h3
                  id="notify-title"
                  className="font-display text-3xl tracking-tight mt-1"
                >
                  Get the {city} guide first.
                </h3>
                <p className="text-ink-600 mt-2 leading-relaxed">
                  Drop your email and we'll send it the moment it's ready —
                  with a founders discount that only the waitlist gets.
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
                    {status === "submitting"
                      ? "Adding you…"
                      : `Notify me about ${city}`}
                  </button>
                </form>

                <p className="mt-4 text-xs text-ink-400 text-center">
                  No spam. One email when the guide drops. Unsubscribe anytime.
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
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // Close any other open modals first
          window.dispatchEvent(new Event(CLOSE_EVENT));
          setOpen(true);
        }}
        className={className}
      >
        Get notified
      </button>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
