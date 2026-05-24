/**
 * Personal intro section. Sits under the hero on the homepage so first-time
 * visitors know who's recommending all these cafes and condos.
 *
 * Photo:
 *   - For now we use a stock travel photo as placeholder.
 *   - Drop your real founders photo at `public/founders.jpg` and change the
 *     src below to "/founders.jpg".
 */

const PLACEHOLDER_PHOTO =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";

export function FoundersIntro() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="grid lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-16 items-center">
        {/* Photo */}
        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-card transform-gpu [clip-path:inset(0_round_1.5rem)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PLACEHOLDER_PHOTO}
            alt="Arni and Valeria"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          {/* Soft gradient at bottom for label legibility */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-900/60 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 text-sand-50">
            <p className="text-[10px] uppercase tracking-[0.18em] font-semibold opacity-90">
              The team
            </p>
            <p className="font-display text-xl tracking-tight mt-0.5">
              Arni & Valeria
            </p>
          </div>
        </div>

        {/* Text */}
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-electric-600 font-semibold mb-3">
            Who's actually writing this
          </p>
          <h2 className="font-display text-3xl sm:text-5xl tracking-tight leading-[1.05]">
            Hi, we're <span className="text-electric-600">Arni & Valeria</span>.
          </h2>
          <div className="mt-6 space-y-4 text-ink-700 text-base sm:text-lg leading-relaxed">
            <p>
              We've spent the last few years bouncing between Bangkok, Bali,
              Chiang Mai and back — working remotely, living slow, learning
              every new city the long way.
            </p>
            <p>
              Every time we landed somewhere new, the same questions came up
              from friends: <em>where do I actually live? which cafes have
              plugs? how do I get a SIM that doesn't suck?</em> The internet
              had a thousand half-answers, mostly from people who'd been there
              for a long weekend.
            </p>
            <p className="text-ink-900 font-medium">
              So we wrote it down properly. These guides are the playbook we
              wish someone had handed us in week one — every cafe, every area,
              every mistake we made so you don't have to.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="text-electric-500">●</span> 6 years nomading
            </span>
            <span className="text-ink-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-electric-500">●</span> 14 cities lived in
            </span>
            <span className="text-ink-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-electric-500">●</span> Too many bad cafes
              tested
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
