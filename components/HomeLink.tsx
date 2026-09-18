"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Explicit "Home" link for the headers - the logo also goes home, but
 * visitors don't reliably know that. Hidden on the homepage itself.
 */
export function HomeLink({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900 transition ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" aria-hidden>
        <path
          d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
      Home
    </Link>
  );
}
