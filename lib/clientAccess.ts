"use client";

const KEY_PREFIX = "fh:access:";

export function storeAccess(guideSlug: string, email: string, token: string) {
  try {
    localStorage.setItem(
      KEY_PREFIX + guideSlug,
      JSON.stringify({ email, token, ts: Date.now() })
    );
  } catch {
    // ignore (e.g. SSR/private mode)
  }
}

export function readAccess(
  guideSlug: string
): { email: string; token: string; ts: number } | null {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + guideSlug);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAccess(guideSlug: string) {
  try {
    localStorage.removeItem(KEY_PREFIX + guideSlug);
  } catch {
    // ignore
  }
}

export function hasAccess(guideSlug: string): boolean {
  return Boolean(readAccess(guideSlug)?.token);
}
