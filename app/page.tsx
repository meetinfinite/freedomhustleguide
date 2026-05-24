import Link from "next/link";
import { listGuides } from "@/lib/guides";
import { SocialProof } from "@/components/SocialProof";
import { NotifyButton } from "@/components/NotifyButton";
import { PurchaseSuccessBanner } from "@/components/PurchaseSuccessBanner";
import { SiteHeader } from "@/components/SiteHeader";
import { SpecialOfferBanner } from "@/components/SpecialOfferBanner";
import { FoundersIntro } from "@/components/FoundersIntro";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getMember } from "@/lib/members";
import { Suspense } from "react";

// Pexels free stock — swap for Valeria's own clip when ready.
const HERO_VIDEO_SRC = "https://www.pexels.com/download/video/6981375/";

// Stock portrait avatars for the hero social-proof row.
// Swap for AI-generated brand avatars when ready.
const AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=70",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=70",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&h=200&q=70",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&h=200&q=70"
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const guides = listGuides();

  // Check member to decide whether to show the promo banner
  const supabase = getSupabaseServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const member = user?.email ? await getMember(user.email) : null;
  const showOffer = !member?.lifetime;

  return (
    <main className="min-h-screen bg-sand-50">
      <Suspense fallback={null}>
        <PurchaseSuccessBanner />
      </Suspense>
      {showOffer ? (
        <SpecialOfferBanner customerEmail={user?.email} />
      ) : null}
      <SiteHeader />

      {/* ----- Video hero ----- */}
      <section className="relative overflow-hidden bg-ink-900">
        <video
          className="absolute inset-0 w-full h-full object-cover bg-ink-900"
          src={HERO_VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/40 via-ink-900/55 to-ink-900/85" />
        <div className="absolute inset-0 bg-hero-grad opacity-40 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-28 sm:pt-32 sm:pb-40">
          <div className="max-w-3xl fade-up">
            <p className="text-xs uppercase tracking-[0.18em] text-electric-300 font-semibold mb-4">
              Digital nomad starter guides
            </p>
            <h1 className="font-display text-5xl sm:text-7xl leading-[1.02] tracking-tight text-sand-50">
              <span className="text-electric-300">Everything</span> we wish
              someone had told us.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-sand-100/90 max-w-2xl leading-relaxed">
              Personal nomad playbooks from years of living it. Cafes,
              coworking, neighbourhoods, gyms — skip to the life you came for.
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

              {/* Hero social-proof strip */}
              <div className="flex items-center gap-3 text-sand-100">
                <div className="flex -space-x-2">
                  {AVATARS.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover border-2 border-ink-900/60 shadow-card"
                      loading="lazy"
                    />
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1 text-sand-50">
                    <Stars />
                    <span className="font-semibold ml-1">4.9</span>
                  </div>
                  <div className="text-sand-200/80 text-xs">
                    1,200+ nomads landed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----- Founders intro ----- */}
      <FoundersIntro />

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
            const isLive = g.status === "live";

            const cardInner = (
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

                {!isLive ? (
                  <div className="absolute top-4 right-4">
                    <span className="text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-ink-900/60 backdrop-blur text-sand-200">
                      Coming soon
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
                    {isLive ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-electric-500 text-white text-sm font-semibold shadow-card">
                        Explore →
                      </span>
                    ) : (
                      <NotifyButton
                        city={g.city}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sand-50 text-ink-900 text-sm font-semibold hover:bg-white transition shadow-card"
                      />
                    )}
                  </div>
                </div>
              </>
            );

            // Card wrapper — uses clip-path for GPU-composited rounded clip
            // (avoids the overflow-hidden + transform corner-flicker bug).
            const cardClass =
              "group relative aspect-[4/5] rounded-3xl shadow-card [clip-path:inset(0_round_1.5rem)]";

            return isLive ? (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className={`${cardClass} hover:shadow-pop transition`}
              >
                {cardInner}
              </Link>
            ) : (
              <div key={g.slug} className={cardClass}>
                {cardInner}
              </div>
            );
          })}
        </div>
      </section>

      {/* ----- Social proof ----- */}
      <SocialProof />

      {/* ----- Footer ----- */}
      <footer className="border-t border-ink-100 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-500">
          <p>© {new Date().getFullYear()} Freedom Hustle</p>
          <p>Built for nomads who actually work.</p>
        </div>
      </footer>
    </main>
  );
}

function Stars() {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          fill="#FBBC04"
          className="w-3 h-3"
          aria-hidden
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}
