import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide, listGuides } from "@/lib/guides";
import { Hero } from "@/components/Hero";
import { CTASection } from "@/components/CTASection";
import { BuyButton } from "@/components/BuyButton";
import { NotifyButton } from "@/components/NotifyButton";
import { PurchaseSuccessBanner } from "@/components/PurchaseSuccessBanner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MoreCities } from "@/components/MoreCities";
import { SpecialOfferBanner } from "@/components/SpecialOfferBanner";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getMember } from "@/lib/members";
import { Suspense } from "react";

export function generateStaticParams() {
  return listGuides().map((g) => ({ slug: g.slug }));
}

const TRUST_CARDS = [
  {
    t: "Lived, not researched",
    d: "Every recommendation comes from actually living there for months - not a 4-day trip and a Google search."
  },
  {
    t: "Honest, not aesthetic",
    d: "We name the areas to skip, the cafes that look great but have terrible WiFi, and the trips that aren't worth it."
  },
  {
    t: "Short on purpose",
    d: "These aren't 52-page PDFs of fluff - who has time to read that? Not us. Skimmable sections, straight answers, done."
  }
];

const FAQ_LIVE = [
  {
    q: "When do I get access?",
    a: "Instantly. After checkout you'll receive a confirmation email, and you'll be able to enter that same email on the access page to unlock the guide."
  },
  {
    q: "Is this just a Notion doc?",
    a: "No. It's a full guide app - sticky navigation, interactive checklists, Google pins, direct links and section pages designed to be skimmed quickly."
  },
  {
    q: "Is this just a PDF?",
    a: "No. This is not a PDF with fluff and pictures of us. It's a full guide app - sticky navigation, interactive checklists, Google pins, direct links and section pages designed to be skimmed quickly."
  },
  {
    q: "Do I need it if I've already been there as a tourist?",
    a: "Travelling somewhere and actually staying there are different games. Where to base yourself for longer, which cafes you can work from, what to do about WiFi - that only matters once you're there for more than a holiday. And if you're not working? The guide still earns its keep: the best cafes, restaurants and places to stay, everything explained simply - the same picks we'd give a friend."
  },
  {
    q: "Will there be more destinations?",
    a: "Yes - 30 destinations across Asia and beyond are on the roadmap, from Da Nang to Tokyo to Dubai. Each guide is bought separately, or Lifetime unlocks every current and future one."
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
      a: "No. It's a full guide app - sticky navigation, interactive checklists, Google pins, direct links and section pages designed to be skimmed quickly."
    },
    {
      q: "Is this just a PDF?",
      a: "No. This is not a PDF with fluff and pictures of us. It's a full guide app - sticky navigation, interactive checklists, Google pins, direct links and section pages designed to be skimmed quickly."
    },
    {
      q: `Will the ${city} guide cover everything Bangkok does?`,
      a: "Yes - same structure: areas to stay, cafes, coworking, gyms, transport, weekend trips, mistakes to avoid, the lot. Tailored to the city, not copy-pasted."
    },
    {
      q: "What does the founders discount look like?",
      a: "Waitlisters get a meaningful discount on launch day - historically around 30%. You'll see the exact number in the launch email."
    },
    {
      q: "Will there be more destinations?",
      a: "Yes - 30 destinations across Asia and beyond are on the roadmap. Each guide is bought separately, or you can grab Lifetime to get everything."
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
  // Owns this specific guide via Lifetime OR a single-guide purchase.
  const ownsGuide = Boolean(
    isLive && member && (member.lifetime || member.guides.includes(guide.slug))
  );
  // Founders (lifetime members) get the full owned experience on soon
  // guides - matches the preview gate on the /app pages.
  const canPreview = Boolean(!isLive && member?.lifetime);
  const ownedView = ownsGuide || canPreview;

  // Most guides declare no heroImage - fall back to cardImage so the
  // hero always has a photo (live guides included; Chiang Mai shipped
  // live with an empty heroImage and rendered a blank hero).
  const heroGuide = {
    ...guide,
    heroImage: guide.heroImage || guide.cardImage
  };

  // Every guide now declares sections via buildSections() from the shared
  // template - live and soon look identical structurally. Soon-city
  // MDX content doesn't exist yet (gated by status check on the app),
  // but the landing-page preview always renders the full template.
  const sectionsForGrid = guide.sections;

  const faq = isLive ? FAQ_LIVE : buildSoonFAQ(guide.city);

  // Primary CTA branches on three states:
  //  - owned (live + signed in + entitled) → straight to the app
  //  - live, not owned → Stripe Checkout
  //  - soon → waitlist modal
  const primaryCTA = (className: string, label?: string) => {
    if (ownedView) {
      return (
        <Link href={`/guides/${guide.slug}/app`} className={className}>
          {label ?? "View guide →"}
        </Link>
      );
    }
    if (isLive) {
      return (
        <BuyButton
          product={guide.slug}
          returnPath={`/guides/${guide.slug}`}
          customerEmail={customerEmail}
          className={className}
        >
          {label ?? `Get the guide - ${guide.price}`}
        </BuyButton>
      );
    }
    return <NotifyButton city={guide.city} className={className} />;
  };

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
      />

      {/* What's inside */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-2xl mb-12">
          <p className="text-xs uppercase tracking-[0.18em] text-electric-600 font-semibold mb-3">
            What's inside
          </p>
          <h2 className="font-display text-4xl sm:text-5xl tracking-tight">
            Everything you wish someone had told you before you booked the
            flight to {guide.city}.
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
              <p className="text-sm text-ink-500 mt-1">
                {s.description.replace("{city}", guide.city)}
              </p>
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
                Digital nomads, remote workers, experienced travellers.
              </h2>
              <p className="text-ink-600 mt-4 text-lg leading-relaxed">
                Freedom Hustle isn't a travel blog. It's a collection of deep
                destination guides for people who want to base themselves
                somewhere and work remotely - and land properly instead of
                guessing for two weeks.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "First-time digital nomads planning their first base abroad",
                "Remote employees taking a quarter somewhere warmer",
                "Freelancers who need to be online for client time zones from day one",
                "Founders who need fast WiFi and a good chair by Monday",
                "Experienced travellers who want depth, not recycled blog fluff",
                "For those not having enough time to do the research - everything in one place. Made easy"
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
        {guide.foundersPhoto ? (
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6 items-stretch">
            {/* Real proof: Arni + Valeria in this exact city */}
            <div className="relative rounded-3xl overflow-hidden shadow-card min-h-[320px] [clip-path:inset(0_round_1.5rem)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={guide.foundersPhoto.src}
                alt={`Arni and Valeria in ${guide.city}`}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-900/70 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 text-sand-50">
                <p className="text-[10px] uppercase tracking-[0.18em] font-semibold opacity-90">
                  We were here
                </p>
                <p className="font-display text-lg tracking-tight mt-0.5">
                  {guide.foundersPhoto.caption}
                </p>
              </div>
            </div>
            <div className="grid gap-6">
              {TRUST_CARDS.map((x) => (
                <div
                  key={x.t}
                  className="rounded-2xl bg-white border border-ink-100 shadow-card p-7"
                >
                  <h3 className="font-display text-xl tracking-tight">{x.t}</h3>
                  <p className="text-ink-600 mt-2 leading-relaxed">{x.d}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {TRUST_CARDS.map((x) => (
            <div
              key={x.t}
              className="rounded-2xl bg-white border border-ink-100 shadow-card p-7"
            >
              <h3 className="font-display text-xl tracking-tight">{x.t}</h3>
              <p className="text-ink-600 mt-2 leading-relaxed">{x.d}</p>
            </div>
          ))}
        </div>
        )}
      </section>

      {/* Price / waitlist - dark panel with city image hinted in the background */}
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
                {ownedView
                  ? "You own this"
                  : isLive
                    ? "One-time payment"
                    : "Waitlist"}
              </p>
              <h2 className="font-display text-4xl sm:text-5xl tracking-tight">
                {ownedView
                  ? `Jump back into ${guide.city}.`
                  : isLive
                    ? `Get the ${guide.city} guide.`
                    : `Be first when ${guide.city} drops.`}
              </h2>
              <p className="text-sand-200 mt-4 text-lg leading-relaxed">
                {ownedView
                  ? "You've got the full guide - pick up wherever you left off."
                  : isLive
                    ? "Instant access. Use it for your whole stay."
                    : `Get the ${guide.city} guide the moment it's ready, with a founders discount only the waitlist gets.`}
              </p>
              <div className="mt-7">
                {primaryCTA(
                  "px-7 py-3.5 rounded-full bg-sand-50 text-ink-900 font-semibold hover:bg-white transition cursor-pointer"
                )}
              </div>
            </div>
            <ul className="space-y-3">
              {[
                "Every section, mobile-friendly app",
                "Monthly/Weekly budget of how much we actually spent",
                "Living checklists that save your progress",
                "Best Cafes + Restaurants + Top Ten Activities",
                "Best Areas to Stay + Gyms & Wellness + Mistakes to Avoid",
                "Written from tons of researching and experiencing it"
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
          ownedView
            ? `Ready to dive back into ${guide.city}?`
            : isLive
              ? `Ready to land in ${guide.city} properly?`
              : `Want the ${guide.city} guide first?`
        }
        subtitle={
          ownedView
            ? "Pick up wherever you left off."
            : isLive
              ? "Get the guide once. Use it for your whole stay."
              : "We'll email you the moment it's live, with a founders discount."
        }
        primaryAction={primaryCTA(
          "px-6 py-3 rounded-full bg-sand-50 text-ink-900 font-medium hover:bg-white transition cursor-pointer"
        )}
      />

      <MoreCities currentSlug={guide.slug} />

      <SiteFooter />
    </main>
  );
}
