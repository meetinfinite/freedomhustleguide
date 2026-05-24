"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { hasAccess, storeAccess } from "@/lib/clientAccess";
import type { GuideMeta } from "@/lib/guides";

interface LockedAccessProps {
  guide: GuideMeta;
  checkoutUrl: string;
}

export function LockedAccess({ guide, checkoutUrl }: LockedAccessProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasAccess(guide.slug)) {
      router.replace(`/guides/${guide.slug}/app`);
    }
  }, [guide.slug, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, guideSlug: guide.slug })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(
          data.message ||
            "Access not found. Please use the email you purchased with."
        );
        return;
      }
      storeAccess(guide.slug, email.trim().toLowerCase(), data.token);
      router.push(`/guides/${guide.slug}/app`);
    } catch {
      setError("Something went wrong. Try again in a moment.");
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
          className="font-display text-lg tracking-tight text-ink-900"
        >
          Freedom Hustle
        </Link>

        <div className="flex-1 flex items-center">
          <div className="w-full max-w-md mx-auto">
            <p className="text-xs uppercase tracking-[0.18em] text-electric-600 font-semibold mb-3">
              {guide.flag} {guide.city} guide
            </p>
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight">
              Unlock your guide.
            </h1>
            <p className="text-ink-600 mt-3 leading-relaxed">
              Enter the email you used to purchase. We'll match it against our
              records and unlock the guide on this device.
            </p>

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
                {submitting ? "Checking…" : "Unlock the guide"}
              </button>
            </form>

            <div className="mt-6 text-sm text-ink-500">
              Don't have it yet?{" "}
              <a
                href={checkoutUrl}
                className="text-electric-600 font-medium hover:underline"
              >
                Get the guide — {guide.price}
              </a>
            </div>

            <p className="mt-8 text-xs text-ink-400 leading-relaxed">
              Your email is checked against our purchase list. Access is stored
              in your browser, so you'll stay signed in here. No password
              required for MVP — we'll add proper accounts when payments are
              live.
            </p>
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
