"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "./BrandLogo";

interface SignInFormProps {
  /** Path the user should land on after clicking the magic link */
  nextPath?: string;
}

export function SignInForm({ nextPath }: SignInFormProps) {
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
        body: JSON.stringify({ email, next: nextPath || "/my" })
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
          <BrandLogo size={40} />
        </Link>

        <div className="flex-1 flex items-center">
          <div className="w-full max-w-md mx-auto">
            <p className="text-xs uppercase tracking-[0.18em] text-electric-600 font-semibold mb-3">
              Members
            </p>

            {sent ? (
              <>
                <h1 className="font-display text-4xl sm:text-5xl tracking-tight">
                  Check your inbox.
                </h1>
                <p className="text-ink-600 mt-3 leading-relaxed">
                  We've sent a sign-in link to <strong>{email}</strong>. Click
                  it and you'll be straight into your dashboard.
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
                  Enter the email you used to buy any Freedom Hustle guide.
                  We'll send a one-tap sign-in link — no password.
                </p>

                <form onSubmit={onSubmit} className="mt-8 space-y-3">
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

                <div className="mt-6 text-sm text-ink-500">
                  Don't have a guide yet?{" "}
                  <Link
                    href="/#guides"
                    className="text-electric-600 font-medium hover:underline"
                  >
                    Browse available guides
                  </Link>
                </div>

                <p className="mt-8 text-xs text-ink-400 leading-relaxed">
                  We send a one-time sign-in link. No passwords to remember.
                  Sessions last 30 days.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Right: brand visual */}
      <section
        className="hidden lg:block relative bg-cover bg-center bg-ink-900"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=2000&q=80')"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-ink-900/40 via-ink-900/55 to-ink-900/90" />
        <div className="relative h-full flex flex-col justify-end p-12 text-sand-50">
          <p className="text-xs uppercase tracking-[0.18em] text-sand-200 font-semibold mb-2">
            Inside Freedom Hustle
          </p>
          <h2 className="font-display text-3xl tracking-tight leading-tight">
            City playbooks that turn a new place into your place.
          </h2>
          <ul className="mt-7 space-y-2 text-sm text-sand-100">
            {[
              "Personal nomad recommendations — cafes, coworking, gyms, neighbourhoods",
              "Honest reviews, lived experience, no tourist fluff",
              "Interactive checklists that save your progress",
              "Regular updates — the city changes, so does the guide"
            ].map((x) => (
              <li key={x} className="flex items-start gap-2">
                <span className="text-electric-300 mt-1">✓</span>
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
