"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import type { GuideMeta } from "@/lib/guides";
import { BuyButton } from "./BuyButton";
import { BrandLogo } from "./BrandLogo";

interface LockedAccessProps {
  guide: GuideMeta;
  /** Path the user should land on after clicking the magic link */
  nextPath?: string;
  /** When true, show "no access" hint above the form */
  noAccess?: boolean;
}

export function LockedAccess({
  guide,
  nextPath,
  noAccess
}: LockedAccessProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          next: nextPath || `/guides/${guide.slug}/app`
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not send the sign-in email.");
        return;
      }
      setSent(true);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-sand-50 grid lg:grid-cols-2">
      {/* Left: form */}
      <section className="flex flex-col p-6 sm:p-12">
        <Link
          href="/"
          aria-label="Freedom Hustle — home"
          className="inline-flex self-start"
        >
          <BrandLogo size={64} />
        </Link>

        <div className="flex-1 flex items-center">
          <div className="w-full max-w-md mx-auto">
            <p className="text-xs uppercase tracking-[0.18em] text-electric-600 font-semibold mb-3">
              {guide.flag} {guide.city} guide
            </p>

            {sent ? (
              <>
                <h1 className="font-display text-4xl sm:text-5xl tracking-tight">
                  Check your inbox.
                </h1>
                <p className="text-ink-600 mt-3 leading-relaxed">
                  We've sent a sign-in link to <strong>{email}</strong>. Click
                  it and you'll be in.
                </p>
                <p className="text-sm text-ink-500 mt-6">
                  Didn't get it? Check spam, or{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setSent(false);
                      setEmail("");
                    }}
                    className="text-electric-600 underline underline-offset-4 hover:text-electric-700"
                  >
                    try a different email
                  </button>
                  .
                </p>
              </>
            ) : (
              <>
                <h1 className="font-display text-4xl sm:text-5xl tracking-tight">
                  Sign in.
                </h1>
                <p className="text-ink-600 mt-3 leading-relaxed">
                  Enter the email you used to buy. We'll send a one-tap
                  sign-in link — no password.
                </p>

                {noAccess ? (
                  <div className="rounded-xl bg-sand-100 border border-sand-200 text-ink-700 text-sm px-4 py-3 mt-5">
                    You're signed in, but this email doesn't have access to
                    the {guide.city} guide.{" "}
                    <BuyButton
                      product={guide.slug}
                      returnPath={`/guides/${guide.slug}`}
                      className="text-electric-600 font-medium hover:underline cursor-pointer"
                    >
                      Buy it now — {guide.price} →
                    </BuyButton>
                  </div>
                ) : null}

                <form onSubmit={onSubmit} className="mt-8 space-y-3">
                  <label className="block">
                    <span className="text-xs uppercase tracking-wider text-ink-500 font-semibold">
                      Purchase email
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

                  {error ? (
                    <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3">
                      {error}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-6 py-3.5 rounded-xl bg-ink-900 text-sand-50 font-semibold hover:bg-ink-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {submitting ? "Sending…" : "Send sign-in link"}
                  </button>
                </form>

                <div className="mt-6 text-sm text-ink-500 flex flex-wrap items-center gap-2">
                  <span>Don't have it yet?</span>
                  <BuyButton
                    product={guide.slug}
                    returnPath={`/guides/${guide.slug}`}
                    className="text-electric-600 font-medium hover:underline cursor-pointer"
                  >
                    Get the {guide.city} guide — {guide.price}
                  </BuyButton>
                  <span className="text-ink-400">·</span>
                  <BuyButton
                    product="lifetime"
                    returnPath={`/guides/${guide.slug}`}
                    className="text-ink-600 font-medium hover:underline cursor-pointer"
                  >
                    Or get Lifetime
                  </BuyButton>
                </div>

                <p className="mt-8 text-xs text-ink-400 leading-relaxed">
                  We send a one-time sign-in link to your email. No passwords
                  to remember. Sessions last 30 days.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Right: visual */}
      <section
        className="hidden lg:block relative bg-cover bg-center"
        style={
          guide.heroImage
            ? { backgroundImage: `url(${guide.heroImage})` }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-gradient-to-br from-ink-900/30 to-ink-900/80" />
        <div className="relative h-full flex flex-col justify-end p-12 text-sand-50">
          <p className="text-xs uppercase tracking-[0.18em] text-sand-200 font-semibold mb-2">
            Inside the guide
          </p>
          <h2 className="font-display text-3xl tracking-tight">
            13 sections. One clean app.
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-2 text-sm">
            {guide.sections.slice(0, 8).map((s) => (
              <li
                key={s.slug}
                className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur border border-white/15 px-3 py-2"
              >
                <span>{s.icon}</span>
                <span className="truncate">{s.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
