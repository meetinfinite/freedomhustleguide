import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your purchase and use of Freedom Hustle guides, operated by Infinite Studio Ltd."
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-sand-50">
      <SiteHeader />

      <article className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-xs uppercase tracking-[0.18em] text-electric-600 font-semibold mb-3">
          Legal
        </p>
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight">
          Terms of Service
        </h1>
        <p className="text-ink-500 mt-3 text-sm">Last updated: 25 May 2026</p>

        <div className="mt-10 space-y-8 text-ink-700 leading-relaxed">
          <section>
            <p>
              These Terms govern your use of{" "}
              <Link href="/" className="underline hover:text-ink-900">
                freedomhustleguide.com
              </Link>{" "}
              and any digital guide you purchase from us. By buying or
              accessing a guide, you agree to these Terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-ink-900 mb-3">
              1. Who we are
            </h2>
            <p>
              Freedom Hustle is operated by{" "}
              <strong>Infinite Studio Ltd</strong>, a company registered in
              England and Wales, company number <strong>11804978</strong>,
              registered office 2 Greet Road, Lancing, West Sussex, BN15 9NT,
              United Kingdom. Contact:{" "}
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
              2. What you&apos;re buying
            </h2>
            <p>
              A Freedom Hustle guide is a digital product — a
              browser-accessible guide app containing written content, interactive
              tools, and curated venue recommendations. There is no physical
              product, no download required, and no app to install.
            </p>
            <p className="mt-3">
              Access is delivered via your purchase email. You can sign in any
              time using a magic link sent to that email.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-ink-900 mb-3">
              3. Price &amp; payment
            </h2>
            <p>
              Prices are shown in GBP (£) and are inclusive of VAT where
              applicable. Payment is handled by Stripe; we never see or store
              your full card details. A purchase is complete when Stripe
              confirms a successful payment.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-ink-900 mb-3">
              4. Lifetime access &amp; updates
            </h2>
            <p>
              &ldquo;Lifetime&rdquo; means the practical lifetime of the
              product as offered by Infinite Studio Ltd. We commit to keeping
              your guide accessible and to publishing reasonable updates as
              the destination changes. If we ever discontinue a guide, we will
              give you at least 30 days&apos; notice and a reasonable refund
              for any guides you can no longer access.
            </p>
            <p className="mt-3">
              The Lifetime bundle includes all current and future city guides
              we publish under the Freedom Hustle brand.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-ink-900 mb-3">
              5. Refunds
            </h2>
            <p>
              <strong>We offer a 7-day, no-questions refund</strong> from the
              date of purchase. Email{" "}
              <a
                href="mailto:support@freedomhustleguide.com"
                className="underline hover:text-ink-900"
              >
                support@freedomhustleguide.com
              </a>{" "}
              and we&apos;ll process it within 5 working days back to your
              original payment method.
            </p>
            <p className="mt-3">
              Note on the UK Consumer Contracts Regulations 2013: digital
              content delivered immediately ordinarily waives the 14-day
              cooling-off period. Our 7-day refund policy is offered in
              addition, as a goodwill commitment.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-ink-900 mb-3">
              6. Your account
            </h2>
            <p>
              Access is tied to the email address used at checkout. Don&apos;t
              share your magic-link emails with anyone — anyone with the link
              can sign in as you. If you lose access to your purchase email,
              contact support and we&apos;ll help you migrate to a new one.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-ink-900 mb-3">
              7. Acceptable use
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>
                Resell, redistribute, or republish guide content (it&apos;s
                copyrighted to Infinite Studio Ltd).
              </li>
              <li>
                Scrape, mirror, or systematically download the guide content.
              </li>
              <li>
                Share your access with others or attempt to bypass paywall
                gating.
              </li>
              <li>
                Use the Site to break the law or infringe anyone else&apos;s
                rights.
              </li>
            </ul>
            <p className="mt-4">
              We may suspend access without refund for serious or repeated
              breaches.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-ink-900 mb-3">
              8. Content disclaimer
            </h2>
            <p>
              Our guides are personal opinion and lived experience — they are
              not professional travel, legal, medical, financial, or
              immigration advice. Prices, venues, visa rules, and local
              conditions change. Verify anything safety-critical with an
              authoritative source before relying on it.
            </p>
            <p className="mt-3">
              You travel and make decisions at your own risk.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-ink-900 mb-3">
              9. Liability
            </h2>
            <p>
              Nothing in these Terms limits our liability for fraud, death or
              personal injury caused by our negligence, or anything else we
              cannot limit by UK law.
            </p>
            <p className="mt-3">
              Subject to the above, our total liability to you for any claim
              arising out of your use of the Site or a guide is capped at the
              amount you paid us in the preceding 12 months. We are not liable
              for indirect or consequential loss.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-ink-900 mb-3">
              10. Changes to these Terms
            </h2>
            <p>
              We may update these Terms over time. Material changes will be
              flagged on the Site. Continued use after a change means you
              accept the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tight text-ink-900 mb-3">
              11. Governing law
            </h2>
            <p>
              These Terms are governed by the laws of England and Wales. Any
              dispute will be resolved in the courts of England and Wales,
              except where mandatory consumer protection rules in your country
              of residence say otherwise.
            </p>
          </section>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
