import { MDXRemote } from "next-mdx-remote/rsc";
import { AreaCard } from "./AreaCard";
import { BudgetCard } from "./BudgetCard";
import { CafeCard } from "./CafeCard";
import { CoworkingCard } from "./CoworkingCard";
import { GymCard } from "./GymCard";
import { Checklist } from "./Checklist";
import { WarningCard } from "./WarningCard";
import { ResourceCard } from "./ResourceCard";
import { TripCard } from "./TripCard";
import { VideoBlock } from "./VideoBlock";
import { ProTip } from "./ProTip";
import { MapPlaceholder } from "./MapPlaceholder";
import { BudgetCalculator } from "./BudgetCalculator";
import { PlaceCard } from "./PlaceCard";

/**
 * Server-component MDX renderer used by the protected guide pages.
 *
 * Reads the compiled MDX at render time (next-mdx-remote/rsc) so the
 * page is fully static-friendly and doesn't depend on Tina Cloud's
 * runtime — Tina parser was returning some of our richer MDX bodies as
 * `{ type: "invalid_markdown" }` which then rendered as raw source on
 * the page. File-based rendering is also faster (no GraphQL round-trip).
 *
 * Tina CMS still works in /admin for editing; it writes to the same
 * MDX files that this component reads on the next request.
 */

const components = {
  AreaCard,
  BudgetCard,
  CafeCard,
  CoworkingCard,
  GymCard,
  Checklist,
  WarningCard,
  ResourceCard,
  TripCard,
  VideoBlock,
  ProTip,
  MapPlaceholder,
  BudgetCalculator,
  PlaceCard
};

export function MdxRenderer({ source }: { source: string }) {
  return (
    <article className="prose-guide max-w-none">
      <MDXRemote source={source} components={components} />
    </article>
  );
}
