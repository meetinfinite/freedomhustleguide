"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Error boundary scoped to the protected guide app. Catches anything thrown
 * by the layout, dashboard, or section pages so users see a usable
 * fallback instead of the raw "server-side exception" digest screen.
 */
export default function GuideAppError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the browser console in dev; Vercel captures this in prod.
    console.error("[guide-app] render error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-sand-50 grid place-items-center px-6">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-electric-600 font-semibold mb-3">
          Something broke
        </p>
        <h1 className="font-display text-3xl sm:text-4xl tracking-tight">
          We hit an error loading this page.
        </h1>
        <p className="text-ink-600 mt-3 leading-relaxed">
          Not your fault. Try again — and if it keeps happening, email{" "}
          <a
            href="mailto:support@freedomhustleguide.com"
            className="underline hover:text-ink-900"
          >
            support@freedomhustleguide.com
          </a>{" "}
          and we&apos;ll sort it.
        </p>
        {error.digest ? (
          <p className="text-xs text-ink-400 mt-3 font-mono">
            ref {error.digest}
          </p>
        ) : null}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="px-5 py-2.5 rounded-full bg-ink-900 text-sand-50 text-sm font-semibold hover:bg-ink-700 transition"
          >
            Try again
          </button>
          <Link
            href="/my"
            className="px-5 py-2.5 rounded-full border border-ink-200 text-ink-900 text-sm font-semibold hover:border-ink-400 transition"
          >
            Back to my guides
          </Link>
        </div>
      </div>
    </div>
  );
}
