"use client";

import { TinaMarkdown, type Components } from "tinacms/dist/rich-text";
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
 * Renders a Tina rich-text body. Maps every custom MDX template declared in
 * tina/config.ts to its real React component.
 *
 * Components whose schema has a nested rich-text field (WarningCard.children,
 * ProTip.children) receive that field as a rich-text JSON object — we render
 * it back into React with a nested <TinaMarkdown>.
 */

const components: Components<Record<string, unknown>> = {
  AreaCard: (props: any) => <AreaCard {...props} />,
  BudgetCard: (props: any) => <BudgetCard {...props} />,
  CafeCard: (props: any) => <CafeCard {...props} />,
  CoworkingCard: (props: any) => <CoworkingCard {...props} />,
  GymCard: (props: any) => <GymCard {...props} />,
  Checklist: (props: any) => <Checklist {...props} />,
  ResourceCard: (props: any) => <ResourceCard {...props} />,
  TripCard: (props: any) => <TripCard {...props} />,
  VideoBlock: (props: any) => <VideoBlock {...props} />,
  MapPlaceholder: (props: any) => <MapPlaceholder {...props} />,
  BudgetCalculator: () => <BudgetCalculator />,
  PlaceCard: (props: any) => <PlaceCard {...props} />,
  WarningCard: (props: any) => (
    <WarningCard title={props.title} severity={props.severity}>
      {props.children ? <TinaMarkdown content={props.children} /> : null}
    </WarningCard>
  ),
  ProTip: (props: any) => (
    <ProTip label={props.label}>
      {props.children ? <TinaMarkdown content={props.children} /> : null}
    </ProTip>
  )
};

export function TinaMdxRenderer({ content }: { content: any }) {
  if (!content) return null;
  return (
    <article className="prose-guide max-w-none">
      <TinaMarkdown content={content} components={components} />
    </article>
  );
}
