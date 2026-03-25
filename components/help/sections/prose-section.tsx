import type { ProseSection } from "../types";

export function ProseSectionRenderer({ text }: ProseSection) {
  return (
    <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
  );
}
