import type { AppLinks } from "@/lib/appLinks";

/**
 * "Download the app" CTA - replaces pay-what-you-want on guide pages once
 * store links exist (see lib/appLinks.ts). Shows whichever stores are set.
 */
export function GetTheApp({
  links,
  className,
  note = "Sign up in the app - every guide is free."
}: {
  links: AppLinks;
  className: string;
  note?: string;
}) {
  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap gap-3">
        {links.ios ? (
          <a href={links.ios} className={className} target="_blank" rel="noopener noreferrer">
            Download on the App Store
          </a>
        ) : null}
        {links.android ? (
          <a href={links.android} className={className} target="_blank" rel="noopener noreferrer">
            Get it on Google Play
          </a>
        ) : null}
      </div>
      <p className="text-xs text-sand-200/80 [text-shadow:0_1px_8px_rgba(15,14,10,0.7)]">
        {note}
      </p>
    </div>
  );
}
