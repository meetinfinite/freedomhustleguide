import Link from "next/link";
import { listGuides } from "@/lib/guides";
import { FooterSubscribe } from "./FooterSubscribe";
import { BrandLogo } from "./BrandLogo";

/**
 * Site-wide footer.
 *
 * Layout: four columns (brand+subscribe, Cities, Support, Connect) then a
 * fine-print legal row with copyright bottom-left and company registration
 * details bottom-right.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const guides = listGuides();

  return (
    <footer className="border-t border-ink-100 bg-sand-50 mt-8">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Top: brand + nav */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {/* Brand + subscribe */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              aria-label="Freedom Hustle — home"
              className="inline-flex"
            >
              <BrandLogo height={56} />
            </Link>
            <p className="text-ink-500 text-sm mt-4 mb-4 max-w-sm leading-relaxed">
              New city drops, travel finds, and the occasional discount —
              delivered when there's something genuinely worth saying.
            </p>
            <FooterSubscribe />
          </div>

          {/* Cities */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.16em] text-ink-400 font-semibold mb-3">
              Cities
            </h4>
            <ul className="space-y-2 text-sm text-ink-600">
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/guides/${g.slug}`}
                    className="hover:text-ink-900 transition inline-flex items-center gap-2"
                  >
                    <span aria-hidden>{g.flag}</span>
                    <span>{g.city}</span>
                    {g.status !== "live" ? (
                      <span className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold">
                        {g.progressLabel ?? "Soon"}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.16em] text-ink-400 font-semibold mb-3">
              Support
            </h4>
            <ul className="space-y-2 text-sm text-ink-600">
              <li>
                <a
                  href="mailto:support@freedomhustleguide.com"
                  className="hover:text-ink-900 transition"
                >
                  support@freedomhustleguide.com
                </a>
              </li>
              <li>
                <Link
                  href="/signin"
                  className="hover:text-ink-900 transition"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  href="/my"
                  className="hover:text-ink-900 transition"
                >
                  My guides
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-ink-900 transition"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-ink-900 transition"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.16em] text-ink-400 font-semibold mb-3">
              Connect
            </h4>
            <ul className="space-y-2 text-sm text-ink-600">
              <li>
                <a
                  href="https://www.instagram.com/thefreedom.hustle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink-900 transition inline-flex items-center gap-2"
                >
                  <InstagramIcon />
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/@TheFreedomHustle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink-900 transition inline-flex items-center gap-2"
                >
                  <YouTubeIcon />
                  <span>YouTube</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@thefreedomhustle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink-900 transition inline-flex items-center gap-2"
                >
                  <TikTokIcon />
                  <span>TikTok</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider + legal row */}
        <div className="border-t border-ink-100 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 text-xs text-ink-500 leading-relaxed">
            <p>Copyright © 2019–{year} Infinite Studio Ltd. All Rights Reserved.</p>
            <p className="sm:text-right">
              Company registered in England and Wales. Company number 11804978.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Brand icons (inline SVG, no external deps) ---------- */

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-4 h-4"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4 h-4"
      aria-hidden
    >
      <path d="M23 7.1a3 3 0 0 0-2.1-2.1C19 4.5 12 4.5 12 4.5s-7 0-8.9.5A3 3 0 0 0 1 7.1C.5 9 .5 12 .5 12s0 3 .5 4.9a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-4.9.5-4.9s0-3-.5-4.9zM9.8 15.5v-7l6.2 3.5-6.2 3.5z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4 h-4"
      aria-hidden
    >
      <path d="M19.6 6.7a5.6 5.6 0 0 1-3.3-1.1A5.6 5.6 0 0 1 14.2 2h-3.4v13.4a2.5 2.5 0 1 1-2.5-2.5c.2 0 .5 0 .7.1V9.5a6 6 0 0 0-.7 0 6 6 0 1 0 6 6V9.6a8.9 8.9 0 0 0 5.3 1.7V7.9c-.1 0-.1 0 0-1.2z" />
    </svg>
  );
}
