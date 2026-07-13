/**
 * Personal intro section. Sits under the hero on the homepage so first-time
 * visitors know who's recommending all these cafes and condos.
 *
 * Photo: served from /public/uploads/. Swap by either:
 *   - Replacing the file at public/uploads/welcome.jpg, or
 *   - Uploading a new one via Tina admin → updating the FOUNDERS_PHOTO path.
 */

const FOUNDERS_PHOTO = "/uploads/welcome.jpg";

export function FoundersIntro() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="grid lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-16 items-center">
        {/* Photo */}
        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-card transform-gpu [clip-path:inset(0_round_1.5rem)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={FOUNDERS_PHOTO}
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
              Chiang Mai, Koh Samui, Tokyo and back — working remotely, living
              slow, learning every new place the long way.
            </p>
            <p>
              Every time we landed somewhere new, the same questions came up
              from friends: <em>where is the best place to stay? best
              restaurants? what's the best season to travel? how do I get a
              SIM that doesn't suck?</em> The internet had a thousand
              half-answers, mostly from people who'd been there for a long
              weekend.
            </p>
            <p className="text-ink-900 font-medium">
              So we wrote it down properly. These guides are the playbook we
              wish someone had handed us in week one — every cafe, every area,
              every mistake we made so you don't have to.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
