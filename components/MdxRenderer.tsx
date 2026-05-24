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
