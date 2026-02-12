import { NextResponse } from "next/server";
import { AIRecommendation } from "@/types";

// TODO: Replace with real recommendation engine / database query
const RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: "1",
    supplierId: "4", // Shenzhen Manufacturing Hub
    action: "Initiate third-party investigation",
    reason:
      "Multiple harassment allegations against same supervisor with evidence of retaliation fear",
    urgency: "immediate",
    category: "investigation",
    linkedModule: "connect",
  },
  {
    id: "2",
    supplierId: "4",
    action: "Deploy mandatory respectful workplace training",
    reason:
      "Survey shows 68% fear speaking up - urgent culture intervention needed",
    urgency: "this_week",
    category: "training",
    linkedModule: "educate",
  },
  {
    id: "3",
    supplierId: "1", // Tiruppur Textiles
    action: "Conduct payroll system audit",
    reason:
      "Recurring overtime calculation issues suggest systemic problem, not isolated incidents",
    urgency: "this_week",
    category: "investigation",
    linkedModule: "connect",
  },
  {
    id: "4",
    supplierId: "2", // Dhaka Garments
    action: "Complete fire exit audit",
    reason: "Worker report + survey data indicate multiple blocked exits",
    urgency: "immediate",
    category: "remediation",
    linkedModule: "connect",
  },
  {
    id: "5",
    supplierId: "8", // Phnom Penh Stitching
    action: "Escalate to brand compliance",
    reason:
      "Freedom of association concerns require brand-level intervention per HRDD requirements",
    urgency: "immediate",
    category: "investigation",
    linkedModule: "connect",
  },
  {
    id: "6",
    supplierId: "6", // Mumbai Textile Works
    action: "Install air quality monitoring",
    reason:
      "Health complaints from dye section indicate potential occupational health risk",
    urgency: "this_week",
    category: "remediation",
    linkedModule: "connect",
  },
];

export async function GET() {
  return NextResponse.json(RECOMMENDATIONS);
}
