import Link from "next/link";
import { listGuides, listPreviewGuides } from "@/lib/guides";
import { PurchaseSuccessBanner } from "@/components/PurchaseSuccessBanner";
import { SiteHeader } from "@/components/SiteHeader";
import { FoundersIntro } from "@/components/FoundersIntro";
import { LaunchOfferBanner } from "@/components/LaunchOfferBanner";
import { NotifyButton } from "@/components/NotifyButton";
import { WorkFromAnywhereStrip } from "@/components/WorkFromAnywhereStrip";
import { SiteFooter } from "@/components/SiteFooter";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getMember } from "@/lib/members";
import { Suspense } from "react";

// Valeria's own hero clip (H.264, muted, ~10s loop). Source master
// lives locally as public/uploads/Hero.mp4 (gitignored, HEVC).
const HERO_VIDEO_SRC = "/uploads/hero-web.mp4";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const guides = listGuides();

  // Check member to decide whether to show the promo banner
  const supabase = getSupabaseServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const member = user?.email ? await getMember(user.email) : null;
  // Founders see in-progress guides without the "Coming soon" badge -
  // for them these cards behave like launched guides.
  const previewSlugs = new Set(
    member?.lifetime ? listPreviewGuides().map((g) => g.slug) : []
  );

  return (
    <main className="min-h-screen bg-sand-50">
      <Suspense fallback={null}>
        <PurchaseSuccessBanner />
      </Suspense>
      {/* Lifetime offer paused until the guide library is bigger
          (Valeria, 2026-08-05) - restore SpecialOfferBanner here. */}
      <LaunchOfferBanner />
      <SiteHeader />

      {/* ----- Video hero ----- */}
      <section className="relative overflow-hidden bg-ink-900">
        <video
          className="absolute inset-0 w-full h-full object-cover bg-ink-900"
          src={HERO_VIDEO_SRC}
          poster="/uploads/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
        />
        {/* Keep the video vivid - legibility comes from the text shadows
            below, not from darkening the whole frame */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/35 via-ink-900/45 to-ink-900/80" />
        <div className="absolute inset-0 bg-hero-grad opacity-40 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-28 sm:pt-32 sm:pb-40">
          <div className="max-w-3xl fade-up">
            <p className="text-xs uppercase tracking-[0.18em] text-sand-50 font-semibold mb-4 [text-shadow:0_1px_12px_rgba(15,14,10,0.85)]">
              Lived In. Researched. Experienced
            </p>
            <h1 className="font-display text-5xl sm:text-7xl leading-[1.02] tracking-tight text-sand-50 [text-shadow:0_2px_28px_rgba(15,14,10,0.85),0_1px_4px_rgba(15,14,10,0.55)]">
              Travel guides for{" "}
              <span className="block text-electric-300">remote workers</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-sand-100/90 max-w-2xl leading-relaxed [text-shadow:0_1px_14px_rgba(15,14,10,0.9)]">
              Built from years of travelling full time. Best cafes, best
              places to stay, best restaurants - and everything you need to
              know before travelling.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#guides"
                className="px-6 py-3 rounded-full bg-sand-50 text-ink-900 font-medium hover:bg-white transition shadow-pop inline-flex items-center gap-2"
              >
                Explore guides
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-4 h-4"
                  aria-hidden
                >
                  <path
                    d="M12 5v14M5 12l7 7 7-7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>

            </div>
          </div>
        </div>
      </section>

      {/* ----- Available guides ----- */}
      <section
        id="guides"
        className="max-w-6xl mx-auto px-6 pt-20 pb-12 scroll-mt-20"
      >
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.18em] text-electric-600 font-semibold mb-3">
            Available guides
          </p>
          <h2 className="font-display text-2xl sm:text-3xl tracking-tight">
            Freedom Hustle Guide to…
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {guides.map((g) => {
            // Launching guides (written, awaiting Stripe) and founder
            // previews present exactly like live ones on the card.
            const showReady =
              g.status === "live" || g.launching || previewSlugs.has(g.slug);

            // Card wrapper - uses clip-path for GPU-composited rounded clip
            // (avoids the overflow-hidden + transform corner-flicker bug).
            const cardClass =
              "group relative aspect-[4/5] rounded-3xl shadow-card hover:shadow-pop transition [clip-path:inset(0_round_1.5rem)]";

            const cardBody = (
              <>
                {g.cardImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.cardImage}
                    alt={`${g.city}, ${g.country}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-ink-200" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/20 to-ink-900/10" />

                {!showReady ? (
                  <div className="absolute top-4 right-4">
                    <span className="text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-ink-900/60 backdrop-blur text-sand-200">
                      {g.progressLabel ?? "Coming soon"}
                    </span>
                  </div>
                ) : null}

                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="flex items-center gap-2 text-sand-100/80 text-xs uppercase tracking-wider font-semibold mb-2">
                    <span className="text-base leading-none">{g.flag}</span>
                    <span>{g.country}</span>
                  </div>
                  <h3 className="font-display text-3xl sm:text-4xl tracking-tight text-sand-50 leading-none">
                    {g.city}
                  </h3>
                  <div className="mt-4">
                    {showReady ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold shadow-card bg-electric-500 text-white">
                        Explore →
                      </span>
                    ) : (
                      // Opens the waitlist popup in place - the button
                      // stops propagation so the card link never fires.
                      <NotifyButton
                        city={g.city}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold shadow-card bg-sand-50 text-ink-900 hover:bg-white transition"
                      />
                    )}
                  </div>
                </div>
              </>
            );

            // Not-ready guides aren't clickable - their landing pages
            // aren't finished, so the popup is the only action.
            return showReady ? (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className={cardClass}
              >
                {cardBody}
              </Link>
            ) : (
              <div key={g.slug} className={cardClass}>
                {cardBody}
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats bar removed for launch (2026-08-06) - claiming 560 buyers
          while announcing a launch reads wrong. Restore ~2026-09-06 with
          real numbers: re-add <StatsBar stats={...} /> here with FIGURES YOU CAN EVIDENCE. */}

      {/* ----- Founders intro ----- */}
      <FoundersIntro />

      {/* ----- Social proof ----- */}
      {/* Social-proof section hidden until there are real customer reviews
          to show. Do not re-add invented testimonials — see golden rule 0
          in CLAUDE.md. */}

      {/* ----- Work from Anywhere photo strip ----- */}
      <WorkFromAnywhereStrip />

      <SiteFooter />
    </main>
  );
}
