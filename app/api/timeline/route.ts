import { NextResponse } from "next/server";
import { TimelineEvent } from "@/types";

// TODO: Replace with real timeline aggregation from cases/surveys/training
const TIMELINE_EVENTS: TimelineEvent[] = [
  // Tiruppur Textiles story
  {
    id: "1",
    supplierId: "1",
    date: "2025-11-15",
    type: "problem",
    module: "connect",
    title: "Overtime complaints surge",
    description: "12 cases filed about unpaid overtime in sewing department",
  },
  {
    id: "2",
    supplierId: "1",
    date: "2025-11-20",
    type: "action",
    module: "educate",
    title: "Wage training deployed",
    description: "Rolled out 'Wage & Hours 101' to all workers",
  },
  {
    id: "3",
    supplierId: "1",
    date: "2025-12-10",
    type: "outcome",
    module: "engage",
    title: "Survey shows improvement",
    description: "Wage understanding questions improved by 20%",
  },
  {
    id: "4",
    supplierId: "1",
    date: "2026-01-09",
    type: "problem",
    module: "connect",
    title: "New overtime case filed",
    description:
      "Despite training, calculation issues persist - systemic problem suspected",
  },
  // Shenzhen story
  {
    id: "5",
    supplierId: "4",
    date: "2025-12-01",
    type: "problem",
    module: "connect",
    title: "Harassment complaint filed",
    description: "First report against Line 4 supervisor",
  },
  {
    id: "6",
    supplierId: "4",
    date: "2025-12-20",
    type: "alert",
    module: "engage",
    title: "Survey reveals widespread fear",
    description: "68% of workers report fear of speaking up",
  },
  {
    id: "7",
    supplierId: "4",
    date: "2026-01-05",
    type: "action",
    module: "system",
    title: "Brand escalation",
    description: "Elevated to GlobalWear compliance team for review",
  },
  {
    id: "8",
    supplierId: "4",
    date: "2026-01-08",
    type: "problem",
    module: "connect",
    title: "Additional harassment reports",
    description: "4 more workers come forward with similar complaints",
  },
  // Ho Chi Minh success story
  {
    id: "9",
    supplierId: "3",
    date: "2025-06-01",
    type: "problem",
    module: "engage",
    title: "Low engagement scores",
    description: "Initial survey showed 45% satisfaction",
  },
  {
    id: "10",
    supplierId: "3",
    date: "2025-07-15",
    type: "action",
    module: "educate",
    title: "Comprehensive training program",
    description:
      "Launched supervisor communication training + worker rights modules",
  },
  {
    id: "11",
    supplierId: "3",
    date: "2025-09-01",
    type: "action",
    module: "system",
    title: "Monthly town halls started",
    description: "Management commits to regular worker feedback sessions",
  },
  {
    id: "12",
    supplierId: "3",
    date: "2025-12-20",
    type: "outcome",
    module: "engage",
    title: "89% satisfaction achieved",
    description: "Annual survey shows dramatic improvement",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supplierId = searchParams.get("supplierId");

  let events = TIMELINE_EVENTS;
  if (supplierId) {
    events = events.filter((e) => e.supplierId === supplierId);
  }

  // Sort newest first
  events.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return NextResponse.json(events);
}
