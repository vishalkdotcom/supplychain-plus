import type { InfoGraphicData, InfoGraphicSection } from "./types";
import { HeroSectionRenderer } from "./sections/hero-section";
import { ProblemSectionRenderer } from "./sections/problem-section";
import { FlowSectionRenderer } from "./sections/flow-section";
import { StepListSectionRenderer } from "./sections/step-list-section";
import { CalloutGridSectionRenderer } from "./sections/callout-grid-section";
import { StatHighlightSectionRenderer } from "./sections/stat-highlight-section";
import { BeforeAfterSectionRenderer } from "./sections/before-after-section";
import { ExampleSectionRenderer } from "./sections/example-section";
import { ProseSectionRenderer } from "./sections/prose-section";

function renderSection(section: InfoGraphicSection, index: number) {
  switch (section.type) {
    case "hero":
      return <HeroSectionRenderer key={index} {...section} />;
    case "problem":
      return <ProblemSectionRenderer key={index} {...section} />;
    case "flow":
      return <FlowSectionRenderer key={index} {...section} />;
    case "step-list":
      return <StepListSectionRenderer key={index} {...section} />;
    case "callout-grid":
      return <CalloutGridSectionRenderer key={index} {...section} />;
    case "stat-highlight":
      return <StatHighlightSectionRenderer key={index} {...section} />;
    case "before-after":
      return <BeforeAfterSectionRenderer key={index} {...section} />;
    case "example":
      return <ExampleSectionRenderer key={index} {...section} />;
    case "prose":
      return <ProseSectionRenderer key={index} {...section} />;
  }
}

export function InfoGraphic({ data }: { data: InfoGraphicData }) {
  return (
    <div className="space-y-5">
      {data.sections.map((section, i) => renderSection(section, i))}
    </div>
  );
}
