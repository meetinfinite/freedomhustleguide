import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { API_URL } from "./config";
import { supabase } from "./supabase";
import type { AppGuide, SectionResponse } from "./types";

/**
 * Client for the website's app API (app/api/app/* in the Next.js repo).
 * Content comes from Notion via the website, so editing a guide in Notion
 * shows up here without an app update.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers
    }
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError((body as { error?: string }).error || "Something went wrong. Try again.", res.status);
  }
  return body as T;
}

const GUIDES_CACHE_KEY = "fh:guides:v1";

let guidesInFlight: { at: number; promise: Promise<AppGuide[]> } | null = null;

/** Guide library. Shared across screens for 5 min; `force` skips that. */
export function fetchGuides(force = false): Promise<AppGuide[]> {
  if (!force && guidesInFlight && Date.now() - guidesInFlight.at < 5 * 60_000) {
    return guidesInFlight.promise;
  }
  const promise = request<{ guides: AppGuide[] }>("/api/app/guides").then(({ guides }) => {
    AsyncStorage.setItem(GUIDES_CACHE_KEY, JSON.stringify(guides)).catch(() => {});
    return guides;
  });
  promise.catch(() => {
    guidesInFlight = null;
  });
  guidesInFlight = { at: Date.now(), promise };
  return promise;
}

export function useGuides() {
  return useRemote(() => fetchGuides(), [], cachedGuides);
}

/** Last guide list we saw - lets the home screen paint instantly / offline. */
export async function cachedGuides(): Promise<AppGuide[] | null> {
  try {
    const raw = await AsyncStorage.getItem(GUIDES_CACHE_KEY);
    return raw ? (JSON.parse(raw) as AppGuide[]) : null;
  } catch {
    return null;
  }
}

export function fetchSection(slug: string, section: string) {
  return request<SectionResponse>(`/api/app/guides/${encodeURIComponent(slug)}/${encodeURIComponent(section)}`);
}

export function registerMe() {
  return request<{ email: string; name: string | null }>("/api/app/me", { method: "POST" });
}

export function deleteMe() {
  return request<{ ok: true }>("/api/app/me", { method: "DELETE" });
}

/** Tiny fetch-state hook: { data, error, loading, reload }. */
export function useRemote<T>(load: () => Promise<T>, deps: unknown[], initial?: () => Promise<T | null>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await load());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    let alive = true;
    initial?.().then((cached) => {
      if (alive && cached) setData((d) => d ?? cached);
    });
    run();
    return () => {
      alive = false;
    };
  }, [run]);

  return { data, error, loading, reload: run };
}
