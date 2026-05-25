import { evaluate, type EvaluateOptions } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
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
 * Server-component MDX renderer.
 *
 * Uses @mdx-js/mdx's `evaluate` directly instead of next-mdx-remote/rsc.
 * next-mdx-remote/rsc v6 silently drops every JSX expression attribute
 * (`lines={[…]}`, `items={[…]}`) — only string and boolean literals
 * survive. Our authoring style is heavy on array/object props, so that
 * was a non-starter. `evaluate` compiles MDX into a real React component
 * with full expression support and is the underlying primitive most
 * other MDX renderers wrap.
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

export async function MdxRenderer({ source }: { source: string }) {
  const { default: MDXContent } = await evaluate(source, {
    ...(runtime as unknown as EvaluateOptions),
    baseUrl: import.meta.url
  });
  return (
    <article className="prose-guide max-w-none">
      <MDXContent components={components} />
    </article>
  );
}
