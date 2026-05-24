import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide, listGuides, SHARED_SECTIONS_TEMPLATE } from "@/lib/guides";
import { Hero } from "@/components/Hero";
import { CTASection } from "@/components/CTASection";
import { BuyButton } from "@/components/BuyButton";
import { NotifyButton } from "@/components/NotifyButton";
import { PurchaseSuccessBanner } from "@/components/PurchaseSuccessBanner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SpecialOfferBanner } from "@/components/SpecialOfferBanner";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getMember } from "@/lib/members";
import { Suspense } from "react";

export function generateStaticParams() {
  return listGuides().map((g) => ({ slug: g.slug }));
}

const FAQ_LIVE = [
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
    q: "Do I need it if I've already been there as a tourist?",
    a: "Living and working in a place is genuinely different. Things like where to actually rent for a month, which cafes have plugs, and what to do about WiFi only matter when you stay."
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

function buildSoonFAQ(city: string) {
  return [
    {
      q: `When will the ${city} guide launch?`,
      a: `We don't lock in a public date until we're confident the guide is genuinely useful. Waitlisters get an email the moment it goes live, with a founders discount that only the waitlist gets.`
    },
    {
      q: "Is this just a Notion doc?",
      a: "No. It's a full guide app — sticky navigation, interactive checklists, a budget calculator, and section pages designed to be skimmed on a phone."
    },
    {
      q: "How fresh is the information?",
      a: "We do the research on the ground and review every guide quarterly after launch. Prices, areas, and apps change — we update without you needing to re-buy."
    },
    {
      q: `Will the ${city} guide cover everything Bangkok does?`,
      a: "Yes — same structure: areas to stay, cafes, coworking, gyms, transport, weekend trips, mistakes to avoid, the lot. Tailored to the city, not copy-pasted."
    },
    {
      q: "What does the founders discount look like?",
      a: "Waitlisters get a meaningful discount on launch day — historically around 30%. You'll see the exact number in the launch email."
    },
    {
      q: "Will there be more cities?",
      a: "Yes. We're working on Ubud, Chiang Mai, Koh Samui, Kuala Lumpur, Da Nang, Seoul, Tokyo and Phuket. Each guide is bought separately, or you can grab Lifetime to get everything."
    }
  ];
}

export default async function GuideLandingPage({
  params
}: {
  params: { slug: string };
}) {
  const guide = getGuide(params.slug);
  if (!guide) notFound();

  const isLive = guide.status === "live";

  // Pre-fill Stripe Checkout email when buyer is already signed in
  const supabase = getSupabaseServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const customerEmail = user?.email;
  const member = customerEmail ? await getMember(customerEmail) : null;
  const showOffer = !member?.lifetime;

  // Soon guides have no heroImage — fall back to cardImage so the hero
  // still feels like a real landing page.
  const heroGuide = isLive
    ? guide
    : { ...guide, heroImage: guide.heroImage || guide.cardImage };

  // Sections grid — live guides use their authored sections (sliced past
  // the overview), soon guides use the shared template so waitlisters can
  // see what they'll be getting.
  const sectionsForGrid = isLive ? guide.sections.slice(1) : SHARED_SECTIONS_TEMPLATE.slice(1);

  const faq = isLive ? FAQ_LIVE : buildSoonFAQ(guide.city);

  // Primary CTA = Buy (live) or Get notified (soon).
  const primaryCTA = (className: string, label?: string) =>
    isLive ? (
      <BuyButton
        product={guide.slug}
        returnPath={`/guides/${guide.slug}`}
        customerEmail={customerEmail}
        className={className}
      >
        {label ?? `Get the guide — ${guide.price}`}
      </BuyButton>
    ) : (
      <NotifyButton city={guide.city} className={className} />
    );

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
        guide={heroGuide}
        primaryAction={primaryCTA(
          "px-6 py-3 rounded-full bg-sand-50 text-ink-900 font-medium hover:bg-white transition shadow-pop"
        )}
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
            {isLive
              ? "Everything you wish someone had told you before you booked the flight."
              : `Here's what the ${guide.city} guide will cover.`}
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectionsForGrid.map((s) => (
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

      {/* Price / waitlist — dark panel with city image hinted in the background */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-3xl bg-ink-900 text-sand-50 p-8 sm:p-14 relative overflow-hidden">
          {/* City photo hint at the bottom of the layer stack */}
          {guide.cardImage ? (
            <div
              aria-hidden
              className="absolute inset-0 bg-cover bg-center opacity-35"
              style={{ backgroundImage: `url(${guide.cardImage})` }}
            />
          ) : null}
          {/* Left-to-right dark gradient so the text side stays legible
              while the photo shows through on the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/85 to-ink-900/40" />
          {/* Existing brand gradient on top for warmth */}
          <div className="absolute inset-0 bg-hero-grad opacity-40 mix-blend-overlay" />

          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-electric-300 font-semibold mb-3">
                {isLive ? "One-time payment" : "Waitlist"}
              </p>
              <h2 className="font-display text-4xl sm:text-5xl tracking-tight">
                {isLive
                  ? `Get the ${guide.city} guide.`
                  : `Be first when ${guide.city} drops.`}
              </h2>
              <p className="text-sand-200 mt-4 text-lg leading-relaxed">
                {isLive
                  ? "Instant access. Lifetime updates. 7-day refund if it isn't useful."
                  : `Get the ${guide.city} guide the moment it's ready, with a founders discount only the waitlist gets.`}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                {primaryCTA(
                  "px-7 py-3.5 rounded-full bg-sand-50 text-ink-900 font-semibold hover:bg-white transition cursor-pointer"
                )}
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
          {faq.map((f) => (
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
        title={
          isLive
            ? `Ready to land in ${guide.city} properly?`
            : `Want the ${guide.city} guide first?`
        }
        subtitle={
          isLive
            ? "Get the guide once. Use it for your whole stay."
            : "We'll email you the moment it's live, with a founders discount."
        }
        primaryAction={primaryCTA(
          "px-6 py-3 rounded-full bg-sand-50 text-ink-900 font-medium hover:bg-white transition cursor-pointer"
        )}
        secondaryHref="/signin"
        secondaryLabel="Sign in"
      />

      <SiteFooter />
    </main>
  );
}
