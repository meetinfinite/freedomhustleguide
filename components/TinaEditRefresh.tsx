"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Bridge between Tina admin and the live page.
 *
 * When an editor clicks Save in /admin, Tina writes the .mdx file and posts a
 * message to this window. We listen broadly for save/submit-related messages
 * and run `router.refresh()` so the server component re-runs the Tina query
 * and the preview shows the latest content without a manual reload.
 *
 * Calls a second `router.refresh()` ~600ms later — newly-added blocks (e.g. a
 * fresh PlaceCard) sometimes need the second pass because their data-fetch
 * fires after first hydration.
 *
 * Harmless outside Tina — the listener simply never fires.
 */
export function TinaEditRefresh() {
  const router = useRouter();
  const lastRefreshAt = useRef(0);

  useEffect(() => {
    function triggerRefresh() {
      const now = Date.now();
      // Debounce — Tina can emit several save events in a row
      if (now - lastRefreshAt.current < 200) return;
      lastRefreshAt.current = now;
      router.refresh();
      // Second pass for new blocks that fetch data on mount
      setTimeout(() => router.refresh(), 600);
    }

    function onMessage(e: MessageEvent) {
      const data = e.data;
      if (!data || typeof data !== "object") return;

      const text = JSON.stringify(data).toLowerCase();
      if (
        text.includes("submit") ||
        text.includes("save") ||
        text.includes("publish") ||
        text.includes("document:saved") ||
        text.includes("forms:reset") ||
        text.includes("docnode")
      ) {
        triggerRefresh();
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router]);

  return null;
}
