import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide, listGuides } from "@/lib/guides";
import { Hero } from "@/components/Hero";
import { CTASection } from "@/components/CTASection";
import { BuyButton } from "@/components/BuyButton";
import { PurchaseSuccessBanner } from "@/components/PurchaseSuccessBanner";
import { SiteHeader } from "@/components/SiteHeader";
import { SpecialOfferBanner } from "@/components/SpecialOfferBanner";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getMember } from "@/lib/members";
import { Suspense } from "react";

export function generateStaticParams() {
  return listGuides()
    .filter((g) => g.status === "live")
    .map((g) => ({ slug: g.slug }));
}

const FAQ = [
  {
    q: "When do I get access?",
    a: "Instantly. After checkout you'll receive a confirmation email, and you'll be able to enter that same email on the access page to unlock the guide."
  },
  {
    q: "Is this just a Notion doc?",
    a: "No. It's a full guide app — sticky navigation, interactive checklists, a budget calculator, and section pages designed to be skimmed on a phone."
  },
  {
    q: "How fresh is the information?",
    a: "Reviewed quarterly. Prices, areas, and apps change — we update without you needing to re-buy."
  },
  {
    q: "Do I need it if I've already been to Bangkok as a tourist?",
    a: "Living and working there is genuinely different. Things like where to actually rent for a month, which cafes have plugs, and what to do about WiFi only matter when you stay."
  },
  {
    q: "Is there a refund?",
    a: "Yes — 7-day no-questions refund if it isn't useful."
  },
  {
    q: "Will there be more cities?",
    a: "Yes. Ubud, Chiang Mai, Koh Samui and Kuala Lumpur are next. Each guide is bought separately."
  }
];

export default async function GuideLandingPage({
  params
}: {
  params: { slug: string };
}) {
  const guide = getGuide(params.slug);
  if (!guide || guide.status !== "live") notFound();

  // Pre-fill Stripe Checkout email when buyer is already signed in
  const supabase = getSupabaseServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const customerEmail = user?.email;
  const member = customerEmail ? await getMember(customerEmail) : null;
  const showOffer = !member?.lifetime;

  return (
    <main className="bg-sand-50 min-h-screen">
      <Suspense fallback={null}>
        <PurchaseSuccessBanner />
      </Suspense>
      {showOffer ? (
        <SpecialOfferBanner customerEmail={customerEmail} />
      ) : null}
      <SiteHeader />

      <Hero
        guide={guide}
        primaryAction={
          <BuyButton
            product={guide.slug}
            returnPath={`/guides/${guide.slug}`}
            customerEmail={customerEmail}
            className="px-6 py-3 rounded-full bg-sand-50 text-ink-900 font-medium hover:bg-white transition shadow-pop"
          >
            Get the guide — {guide.price}
          </BuyButton>
        }
        secondaryHref="/signin"
        secondaryLabel="Sign in"
      />

      {/* What's inside */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-2xl mb-12">
          <p className="text-xs uppercase tracking-[0.18em] text-electric-600 font-semibold mb-3">
            What's inside
          </p>
          <h2 className="font-display text-4xl sm:text-5xl tracking-tight">
            Everything you wish someone had told you before you booked the flight.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {guide.sections.slice(1).map((s) => (
            <div
              key={s.slug}
              className="rounded-2xl bg-white border border-ink-100 shadow-card p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-sand-100 grid place-items-center text-xl">
                  {s.icon}
                </div>
                <span className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">
                  {s.readingTime}
                </span>
              </div>
              <h3 className="font-display text-lg tracking-tight text-ink-900">
                {s.title}
              </h3>
              <p className="text-sm text-ink-500 mt-1">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who it's for */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="rounded-3xl bg-white border border-ink-100 shadow-card p-8 sm:p-12">
          <div className="grid lg:grid-cols-2 gap-10">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-electric-600 font-semibold mb-3">
                Who it's for
              </p>
              <h2 className="font-display text-3xl sm:text-4xl tracking-tight">
                Built for nomads who actually work.
              </h2>
              <p className="text-ink-600 mt-4 text-lg leading-relaxed">
                If you're moving abroad to keep your remote job, freelance, or
                build something — and you want to land properly instead of
                guessing for two weeks — this is for you.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "First-time digital nomads",
                "Remote employees relocating for a quarter",
                "Freelancers running on client time zones",
                "Founders who need fast WiFi and a good chair",
                "People who hate generic travel-blog fluff",
                "Anyone tired of buying a flight before they have a plan"
              ].map((x) => (
                <div
                  key={x}
                  className="rounded-xl bg-sand-50 p-4 text-sm text-ink-800 flex gap-2"
                >
                  <span className="text-electric-600 font-bold">✓</span>
                  <span>{x}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why trust */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-6">
          {[
            {
              t: "Lived, not researched",
              d: "Every recommendation comes from actually living there for months — not a 4-day trip and a Google search."
            },
            {
              t: "Honest, not aesthetic",
              d: "We name the areas to skip, the cafes that look great but have terrible WiFi, and the trips that aren't worth it."
            },
            {
              t: "Updated quarterly",
              d: "Cities change. Prices change. Apps change. You get updates without re-buying."
            }
          ].map((x) => (
            <div
              key={x.t}
              className="rounded-2xl bg-white border border-ink-100 shadow-card p-7"
            >
              <h3 className="font-display text-xl tracking-tight">{x.t}</h3>
              <p className="text-ink-600 mt-2 leading-relaxed">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Price */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-3xl bg-ink-900 text-sand-50 p-8 sm:p-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-grad opacity-60" />
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-electric-300 font-semibold mb-3">
                One-time payment
              </p>
              <h2 className="font-display text-4xl sm:text-5xl tracking-tight">
                Get the {guide.city} guide.
              </h2>
              <p className="text-sand-200 mt-4 text-lg leading-relaxed">
                Instant access. Lifetime updates. 7-day refund if it isn't
                useful.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <BuyButton
                  product={guide.slug}
                  returnPath={`/guides/${guide.slug}`}
                  customerEmail={customerEmail}
                  className="px-7 py-3.5 rounded-full bg-sand-50 text-ink-900 font-semibold hover:bg-white transition"
                >
                  Get the guide — {guide.price}
                </BuyButton>
                <Link
                  href="/signin"
                  className="px-6 py-3 rounded-full border border-sand-50/30 text-sand-50 font-medium hover:border-sand-50 transition"
                >
                  Sign in
                </Link>
              </div>
            </div>
            <ul className="space-y-3">
              {[
                "13 full sections, mobile-friendly app",
                "Interactive budget calculator",
                "Living checklists that save your progress",
                "Real cafe + coworking + gym data",
                "Honest reviews of weekend trips",
                "Lifetime updates as the city changes"
              ].map((x) => (
                <li
                  key={x}
                  className="flex items-start gap-3 text-sand-100"
                >
                  <span className="w-5 h-5 rounded-full bg-electric-500 grid place-items-center text-xs shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-xs uppercase tracking-[0.18em] text-electric-600 font-semibold mb-3 text-center">
          FAQ
        </p>
        <h2 className="font-display text-3xl sm:text-4xl tracking-tight text-center">
          Quick answers.
        </h2>
        <div className="mt-10 space-y-3">
          {FAQ.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl bg-white border border-ink-100 shadow-card overflow-hidden"
            >
              <summary className="cursor-pointer list-none px-6 py-5 flex items-center justify-between gap-4 font-semibold text-ink-900">
                <span>{f.q}</span>
                <span className="text-electric-600 transition group-open:rotate-45 text-xl leading-none">
                  +
                </span>
              </summary>
              <div className="px-6 pb-5 text-ink-600 leading-relaxed">
                {f.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      <CTASection
        title={`Ready to land in ${guide.city} properly?`}
        subtitle="Get the guide once. Use it for your whole stay."
        primaryAction={
          <BuyButton
            product={guide.slug}
            returnPath={`/guides/${guide.slug}`}
            customerEmail={customerEmail}
            className="px-6 py-3 rounded-full bg-sand-50 text-ink-900 font-medium hover:bg-white transition"
          >
            Get the guide — {guide.price}
          </BuyButton>
        }
        secondaryHref="/signin"
        secondaryLabel="Sign in"
      />

      <footer className="border-t border-ink-100 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-500">
          <p>© {new Date().getFullYear()} Freedom Hustle</p>
          <p>Built for nomads who actually work.</p>
        </div>
      </footer>
    </main>
  );
}
