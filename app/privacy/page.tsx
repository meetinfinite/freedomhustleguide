import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Freedom Hustle (operated by Infinite Studio Ltd) collects, uses, and protects your data."
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-sand-50">
      <SiteHeader />

      <article className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-xs uppercase tracking-[0.18em] text-electric-600 font-semibold mb-3">
          Legal
        </p>
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-ink-500 mt-3 text-sm">Last updated: 25 May 2026</p>

        <div className="mt-10 space-y-8 text-ink-700 leading-relaxed">
          <section>
            <p>
              This Privacy Policy explains how{" "}
              <strong>Infinite Studio Ltd</strong> (&ldquo;we&rdquo;,
              &ldquo;us&rdquo;, &ldquo;our&rdquo;) handles your personal data
              when you use{" "}
              <Link href="/" className="underline hover:text-ink-900">
                freedomhustleguide.com
              </Link>{" "}
              (the &ldquo;Site&rdquo;) and the Freedom Hustle digital guides.
              We are the data controller for the purposes of UK GDPR.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-ink-900 mb-3">
              1. Who we are
            </h2>
            <p>
              Infinite Studio Ltd is a company registered in England and Wales,
              company number <strong>11804978</strong>, registered office 2
              Greet Road, Lancing, West Sussex, BN15 9NT, United Kingdom. You
              can reach us at{" "}
              <a
                href="mailto:support@freedomhustleguide.com"
                className="underline hover:text-ink-900"
              >
                support@freedomhustleguide.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-ink-900 mb-3">
              2. What we collect
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Email address</strong> — when you buy a guide, sign in
                with a magic link, or join a waitlist.
              </li>
              <li>
                <strong>Payment details</strong> — handled directly by Stripe.
                We never see or store your card number; we only receive a
                confirmation that payment succeeded, plus the last 4 digits and
                card brand for our records.
              </li>
              <li>
                <strong>Anonymous usage stats</strong> — page views and
                referrer (via Plausible Analytics, cookie-free, no personal
                profiling).
              </li>
              <li>
                <strong>Authentication cookies</strong> — set by Supabase Auth
                to keep you signed in. Strictly necessary; expires when your
                session ends.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-ink-900 mb-3">
              3. Why we use it
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>To deliver what you paid for</strong> — granting access
                to your guides (legal basis: contract).
              </li>
              <li>
                <strong>To send transactional emails</strong> — purchase
                confirmation, magic-link sign-in (legal basis: contract).
              </li>
              <li>
                <strong>To improve the product</strong> — aggregated traffic
                analytics, no individual profiling (legal basis: legitimate
                interest).
              </li>
              <li>
                <strong>To notify you about new guides</strong> — only if you
                explicitly joined a waitlist (legal basis: consent).
              </li>
            </ul>
            <p className="mt-4">
              We do not sell your data. We do not run ads. We do not build a
              marketing profile of you.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-ink-900 mb-3">
              4. Third parties we use
            </h2>
            <p>
              We rely on a small number of trusted processors to operate the
              Site:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>
                <strong>Stripe</strong> (Ireland / US) — payment processing.
              </li>
              <li>
                <strong>Supabase</strong> (US/EU) — authentication and database.
              </li>
              <li>
                <strong>Resend</strong> (US) — transactional email delivery.
              </li>
              <li>
                <strong>Vercel</strong> (US) — website hosting.
              </li>
              <li>
                <strong>Plausible Analytics</strong> (EU) — cookie-free,
                privacy-friendly analytics.
              </li>
              <li>
                <strong>ImprovMX</strong> (EU) — email forwarding for our
                support inbox.
              </li>
              <li>
                <strong>Google Places API</strong> (US) — venue data shown
                inside the guides (we do not share your personal data with
                Google).
              </li>
            </ul>
            <p className="mt-4">
              Where data leaves the UK/EEA, transfers are protected by
              Standard Contractual Clauses or equivalent safeguards.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-ink-900 mb-3">
              5. How long we keep it
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Purchase records</strong> — 7 years (UK tax /
                accounting requirements).
              </li>
              <li>
                <strong>Account &amp; access data</strong> — for as long as you
                hold access to a guide.
              </li>
              <li>
                <strong>Waitlist emails</strong> — until you unsubscribe.
              </li>
              <li>
                <strong>Analytics</strong> — aggregated, no personal identifiers
                retained.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-ink-900 mb-3">
              6. Your rights
            </h2>
            <p>
              Under UK GDPR you can ask us to access, correct, delete, or
              export your data, object to processing, or withdraw consent at
              any time. Just email{" "}
              <a
                href="mailto:support@freedomhustleguide.com"
                className="underline hover:text-ink-900"
              >
                support@freedomhustleguide.com
              </a>{" "}
              and we&apos;ll action it within 30 days.
            </p>
            <p className="mt-3">
              You also have the right to complain to the UK Information
              Commissioner&apos;s Office (
              <a
                href="https://ico.org.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-ink-900"
              >
                ico.org.uk
              </a>
              ).
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-ink-900 mb-3">
              7. Changes to this policy
            </h2>
            <p>
              If we materially change this policy, we&apos;ll update the
              &ldquo;Last updated&rdquo; date and, for significant changes,
              email you if we have your address.
            </p>
          </section>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
