export type HeroSection = {
  type: "hero";
  title: string;
  subtitle: string;
  icon: string;
};

export type ProblemSection = {
  type: "problem";
  text: string;
};

export type FlowSection = {
  type: "flow";
  steps: { label: string; icon: string; description: string }[];
  direction: "horizontal" | "circular";
};

export type StepListSection = {
  type: "step-list";
  title: string;
  steps: { number: number; label: string; detail: string }[];
};

export type CalloutGridSection = {
  type: "callout-grid";
  items: { icon: string; title: string; text: string; color?: string }[];
};

export type StatHighlightSection = {
  type: "stat-highlight";
  stats: { value: string; label: string }[];
};

export type BeforeAfterSection = {
  type: "before-after";
  before: { title: string; items: string[] };
  after: { title: string; items: string[] };
};

export type ExampleSection = {
  type: "example";
  title: string;
  steps: string[];
};

export type ProseSection = {
  type: "prose";
  text: string;
};

export type InfoGraphicSection =
  | HeroSection
  | ProblemSection
  | FlowSection
  | StepListSection
  | CalloutGridSection
  | StatHighlightSection
  | BeforeAfterSection
  | ExampleSection
  | ProseSection;

export type InfoGraphicData = {
  id: string;
  title: string;
  domain: string;
  shortDescription: string;
  sections: InfoGraphicSection[];
};
