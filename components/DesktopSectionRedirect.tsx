"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * On desktop the sidebar already lists every section, so the guide
 * overview just repeated it - opening a guide there goes straight into
 * the first section. Phones keep the overview: it's the only place they
 * see all the sections at once (Valeria, 2026-10-10).
 *
 * 1024px matches the `lg` breakpoint where the sidebar appears.
 */
export function DesktopSectionRedirect({ href }: { href: string }) {
  const router = useRouter();
  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) router.replace(href);
  }, [href, router]);
  return null;
}
