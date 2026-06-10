"use client";

import { useEffect } from "react";

/**
 * Renders a GetYourGuide "activity" widget card for a single tour.
 *
 * GYG's loader script (pa.umd) scans the page for `[data-gyg-href]`
 * containers and replaces each with an iframe card (photo, title, rating,
 * "Book" CTA), carrying the partner id for affiliate attribution. We load
 * that script once; it observes the DOM, so cards added on client-side
 * navigation hydrate automatically.
 */

const SCRIPT_SRC =
  "https://widget.getyourguide.com/dist/pa.umd.production.min.js";
const ACTIVITIES_FRAME =
  "https://widget.getyourguide.com/default/activities.frame";

export function GygWidget({
  tourId,
  partnerId,
  locale = "en-GB"
}: {
  tourId: string;
  partnerId: string;
  locale?: string;
}) {
  useEffect(() => {
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return;
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    if (partnerId) s.setAttribute("data-gyg-partner-id", partnerId);
    document.body.appendChild(s);
  }, [partnerId]);

  return (
    <div className="my-6">
      <div
        data-gyg-href={ACTIVITIES_FRAME}
        data-gyg-locale-code={locale}
        data-gyg-widget="activities"
        data-gyg-number-of-items="1"
        data-gyg-partner-id={partnerId}
        data-gyg-tour-ids={tourId}
      />
    </div>
  );
}
