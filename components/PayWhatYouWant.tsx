"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  PWYW_DEFAULT,
  PWYW_PRESETS,
  amountError,
  formatPounds,
  parsePounds
} from "@/lib/pwyw";

interface PayWhatYouWantProps {
  guide: { slug: string; city: string };
  /** Where Stripe returns the reader after a paid checkout. */
  returnPath?: string;
  /** Pre-fill when the reader is already signed in. */
  customerEmail?: string;
  className?: string;
  children: React.ReactNode;
}

type Step = "form" | "submitting" | "sent";

// Opening one picker closes any other (the landing page renders several).
const CLOSE_EVENT = "pwyw:close-others";

/**
 * "Get the guide" trigger + pay-what-you-want modal.
 * Pick £3 / £5 / £10 or type any amount (£0 is fine), then name + email.
 * £0 unlocks straight away and emails a sign-in link; £1+ goes to Stripe.
 */
export function PayWhatYouWant({
  guide,
  returnPath,
  customerEmail,
  className = "",
  children
}: PayWhatYouWantProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [preset, setPreset] = useState<number | "custom">(PWYW_DEFAULT);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(customerEmail ?? "");
  const [optIn, setOptIn] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState<string | null>(null);
  const [emailFailed, setEmailFailed] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener(CLOSE_EVENT, close);
    return () => window.removeEventListener(CLOSE_EVENT, close);
  }, []);

  // Back button from Stripe restores the page from bfcache mid-"submitting".
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) setStep("form");
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

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

  // null = custom box empty or unparseable
  const amount = preset === "custom" ? parsePounds(custom) : preset;
  const amountProblem =
    amount === null ? null : amountError(amount);
  const isFree = amount === 0;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (amount === null) {
      setError("Type an amount - £0 is fine.");
      return;
    }
    if (amountProblem) {
      setError(amountProblem);
      return;
    }
    setError(null);
    setStep("submitting");
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guide: guide.slug,
          amount,
          name,
          email,
          marketingOptIn: optIn,
          returnPath: returnPath ?? `/guides/${guide.slug}`
        })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Something went wrong. Try again.");
        setStep("form");
        return;
      }
      if (data.url) {
        window.location.href = data.url; // Stripe Checkout
        return;
      }
      if (data.redirect) {
        window.location.href = data.redirect; // already signed in
        return;
      }
      setEmailFailed(Boolean(data.emailFailed));
      setStep("sent");
    } catch {
      setError("Network error. Try again.");
      setStep("form");
    }
  }

  function close() {
    setOpen(false);
    setTimeout(() => {
      if (step === "sent") setStep("form");
      setError(null);
    }, 200);
  }

  const chip = (active: boolean) =>
    `flex-1 min-w-0 px-3 py-3 rounded-2xl border-2 font-semibold transition cursor-pointer ${
      active
        ? "border-ink-900 bg-ink-900 text-sand-50"
        : "border-ink-200 bg-white text-ink-900 hover:border-ink-400"
    }`;

  const modal = open ? (
    <div
      className="fixed inset-0 z-[60] grid place-items-center p-4 bg-ink-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwyw-title"
        className="relative w-full max-w-md rounded-3xl bg-white shadow-pop p-6 sm:p-8 fade-up my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 grid place-items-center rounded-full text-ink-400 hover:text-ink-900 hover:bg-sand-100 transition"
        >
          ✕
        </button>

        {step === "sent" ? (
          <div className="text-center py-2">
            <div className="text-4xl mb-3" aria-hidden>
              📬
            </div>
            <h3 id="pwyw-title" className="font-display text-3xl tracking-tight">
              It's yours.
            </h3>
            {emailFailed ? (
              <p className="text-ink-600 mt-3 leading-relaxed">
                The {guide.city} guide is unlocked for <strong>{email}</strong>,
                but the sign-in email didn't send. Use{" "}
                <a
                  href={`/guides/${guide.slug}/access`}
                  className="text-electric-600 underline underline-offset-4"
                >
                  sign in
                </a>{" "}
                to get a fresh link.
              </p>
            ) : (
              <p className="text-ink-600 mt-3 leading-relaxed">
                We've emailed a one-tap sign-in link to{" "}
                <strong>{email}</strong>. Open it and you're straight into the{" "}
                {guide.city} guide. Can't see it? Check spam.
              </p>
            )}
            <button
              type="button"
              onClick={close}
              className="mt-6 w-full px-5 py-3 rounded-full bg-ink-900 text-sand-50 font-medium hover:bg-ink-700 transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <h3
              id="pwyw-title"
              className="font-display text-3xl tracking-tight pr-8"
            >
              Get the {guide.city} guide
            </h3>
            <p className="text-ink-600 mt-2 leading-relaxed">
              Pay £0 or whatever feels right. 🧡
            </p>

            <div className="mt-5 flex gap-2" role="radiogroup" aria-label="Amount">
              {PWYW_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={preset === p}
                  onClick={() => {
                    setPreset(p);
                    setError(null);
                  }}
                  className={chip(preset === p)}
                >
                  {formatPounds(p)}
                </button>
              ))}
            </div>
            <button
              type="button"
              role="radio"
              aria-checked={preset === "custom"}
              onClick={() => {
                setPreset("custom");
                setError(null);
              }}
              className={`${chip(preset === "custom")} w-full mt-2`}
            >
              Choose amount
            </button>
            {preset === "custom" ? (
              <label className="mt-2 flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-ink-200 focus-within:border-electric-500 bg-white">
                <span className="font-semibold text-ink-500">£</span>
                <input
                  autoFocus
                  inputMode="decimal"
                  value={custom}
                  onChange={(e) => {
                    setCustom(e.target.value);
                    setError(null);
                  }}
                  placeholder="type any amount, even 0"
                  aria-label="Amount in pounds"
                  className="w-full bg-transparent outline-none text-ink-900"
                />
              </label>
            ) : null}

            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-ink-500 font-semibold">
                  Your name
                </span>
                <input
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-ink-200 bg-white focus:border-electric-500 focus:outline-none focus:ring-4 focus:ring-electric-100 transition"
                />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-ink-500 font-semibold">
                  Your email
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-ink-200 bg-white focus:border-electric-500 focus:outline-none focus:ring-4 focus:ring-electric-100 transition"
                />
                <span className="block text-xs text-ink-400 mt-1.5">
                  Your guide lives here - we email you a one-tap sign-in link.
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm text-ink-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={optIn}
                  onChange={(e) => setOptIn(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-electric-600 shrink-0"
                />
                <span>
                  Email me when new city guides drop, plus the occasional
                  travel tip. Unsubscribe anytime.
                </span>
              </label>
            </div>

            {error || amountProblem ? (
              <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3">
                {error || amountProblem}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={step === "submitting"}
              className="mt-5 w-full px-5 py-3.5 rounded-full bg-electric-500 text-white font-semibold hover:bg-electric-600 disabled:opacity-60 disabled:cursor-wait transition"
            >
              {step === "submitting"
                ? isFree
                  ? "Unlocking…"
                  : "Opening checkout…"
                : isFree
                  ? "Email me the guide"
                  : amount === null || amountProblem
                    ? "Get the guide"
                    : `Continue to pay ${formatPounds(amount)}`}
            </button>
            {!isFree ? (
              <p className="mt-3 text-xs text-ink-400 text-center">
                Secure payment by Stripe
              </p>
            ) : null}
          </form>
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
          window.dispatchEvent(new Event(CLOSE_EVENT));
          setOpen(true);
        }}
        className={className}
      >
        {children}
      </button>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
