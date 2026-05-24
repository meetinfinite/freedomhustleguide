import Link from "next/link";

/**
 * Site-wide footer.
 *
 * Three rows: brand + tagline, nav links + support contact, and a fine-print
 * legal block naming the company that takes payment (required for Stripe /
 * UK consumer-rights transparency).
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-100 bg-sand-50 mt-8">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Top: brand + nav */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="font-display text-xl tracking-tight text-ink-900"
            >
              Freedom Hustle
            </Link>
            <p className="text-ink-500 text-sm mt-3 max-w-sm leading-relaxed">
              Personal nomad playbooks from years of living it. Cafes,
              coworking, neighbourhoods, gyms — skip to the life you came for.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.16em] text-ink-400 font-semibold mb-3">
              Guides
            </h4>
            <ul className="space-y-2 text-sm text-ink-600">
              <li>
                <Link
                  href="/guides/bangkok"
                  className="hover:text-ink-900 transition"
                >
                  Bangkok
                </Link>
              </li>
              <li>
                <Link
                  href="/#guides"
                  className="hover:text-ink-900 transition"
                >
                  All cities
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
            </ul>
          </div>

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
        </div>

        {/* Divider */}
        <div className="border-t border-ink-100 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 text-xs text-ink-500 leading-relaxed">
            <p>
              Built for nomads who actually work.
            </p>
            <p className="sm:text-right">
              Copyright © 2019–{year} Infinite Studio Ltd. All Rights Reserved.
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              Company registered in England and Wales. Company number 11804978.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
