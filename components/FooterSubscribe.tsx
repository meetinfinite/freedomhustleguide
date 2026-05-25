"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "submitting" | "ok" | "already" | "error";

/**
 * Inline email-capture form for the site footer. Posts to /api/notify
 * with a sentinel "Newsletter" city so we can distinguish general
 * newsletter signups from city-specific waitlist signups in Supabase.
 */
export function FooterSubscribe() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  if (status === "ok" || status === "already") {
    return (
      <div className="rounded-xl bg-sand-100 border border-ink-100 px-4 py-3 text-sm text-ink-700">
        {status === "already"
          ? "You're already on the list — thanks!"
          : "You're in. We'll only send the good stuff."}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Email address"
          className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-ink-200 bg-white text-sm text-ink-900 focus:border-electric-500 focus:outline-none focus:ring-4 focus:ring-electric-100 transition"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="px-4 py-2.5 rounded-xl bg-ink-900 text-sand-50 text-sm font-semibold hover:bg-ink-700 disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0"
        >
          {status === "submitting" ? "…" : "Subscribe"}
        </button>
      </div>
      {errorMsg ? (
        <p className="text-xs text-rose-600">{errorMsg}</p>
      ) : (
        <p className="text-xs text-ink-500">
          No spam. Just new city drops, real travel finds, and the occasional
          discount.
        </p>
      )}
    </form>
  );
}
