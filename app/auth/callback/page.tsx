"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function AuthCallbackPageWrapper() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen grid place-items-center bg-sand-50">
          <div className="text-center">
            <div
              className="w-10 h-10 mx-auto rounded-full border-2 border-electric-500 border-t-transparent animate-spin mb-4"
              aria-hidden
            />
            <p className="text-ink-600 text-sm">Loading…</p>
          </div>
        </main>
      }
    >
      <AuthCallback />
    </Suspense>
  );
}

/**
 * Magic-link landing. Handles BOTH Supabase auth flows:
 *
 *  - PKCE / server-side flow: ?code=... query param → exchangeCodeForSession
 *  - Implicit / hash flow:    #access_token=... in URL hash → SDK auto-detects
 *
 * Magic links sent from a service-role admin client end up using the implicit
 * flow (token in the hash), so we must run client-side to read it. The browser
 * Supabase client has detectSessionInUrl on by default — it will pick up the
 * hash, set the session cookie, fire SIGNED_IN, and clear the hash from the URL.
 */
function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    let cancelled = false;

    async function handle() {
      // First, check the URL hash for an explicit Supabase error
      // (e.g. expired link, invalid token). Format: #error=...&error_description=...
      if (typeof window !== "undefined" && window.location.hash) {
        const hashParams = new URLSearchParams(
          window.location.hash.replace(/^#/, "")
        );
        const err = hashParams.get("error_description") || hashParams.get("error");
        if (err) {
          console.warn("[auth/callback] supabase returned error in hash:", err);
          setError(err.replace(/\+/g, " "));
          return;
        }
      }
      // Same check for query-string error
      const queryError =
        params.get("error_description") || params.get("error");
      if (queryError) {
        console.warn("[auth/callback] supabase returned error in query:", queryError);
        setError(queryError);
        return;
      }

      // Branch 1 — PKCE / server flow (?code=)
      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (error) {
          setError(error.message);
          return;
        }
        router.replace(next);
        return;
      }

      // Branch 2 — Implicit / hash flow (#access_token=)
      // The browser SDK auto-detects the hash on init. Either we already have
      // a session, or one is being set as we speak. Listen for SIGNED_IN.
      const { data: existing } = await supabase.auth.getSession();
      if (existing?.session) {
        if (cancelled) return;
        router.replace(next);
        return;
      }

      const { data: sub } = supabase.auth.onAuthStateChange(
        (event: string, session: { user: unknown } | null) => {
          if (event === "SIGNED_IN" && session && !cancelled) {
            sub.subscription.unsubscribe();
            router.replace(next);
          }
        }
      );

      // Belt-and-braces timeout
      setTimeout(async () => {
        if (cancelled) return;
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          sub.subscription.unsubscribe();
          router.replace(next);
        } else {
          sub.subscription.unsubscribe();
          setError(
            "Sign-in link expired or invalid. Request a new one and try again."
          );
        }
      }, 5000);
    }

    handle();
    return () => {
      cancelled = true;
    };
  }, [router, params, next]);

  if (error) {
    return (
      <main className="min-h-screen grid place-items-center bg-sand-50 p-6">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl tracking-tight text-ink-900">
            Sign-in failed
          </h1>
          <p className="text-ink-600 mt-3 leading-relaxed">{error}</p>
          <button
            type="button"
            onClick={() => router.push("/guides/bangkok/access")}
            className="mt-6 px-6 py-3 rounded-full bg-ink-900 text-sand-50 font-semibold hover:bg-ink-700 transition"
          >
            Request new sign-in link
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid place-items-center bg-sand-50">
      <div className="text-center">
        <div
          className="w-10 h-10 mx-auto rounded-full border-2 border-electric-500 border-t-transparent animate-spin mb-4"
          aria-hidden
        />
        <p className="text-ink-600 text-sm">Signing you in…</p>
      </div>
    </main>
  );
}
