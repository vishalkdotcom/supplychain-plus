/** Shared risk-level color/badge mapping utilities. */

/** Risk level string → indicator dot color (Tailwind CSS class). */
export function getRiskColor(level: string): string {
  switch (level) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-orange-500";
    case "low":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
}

/** Risk level string → shadcn Badge variant. */
export function getRiskBadgeVariant(
  level: string,
): "destructive" | "default" | "secondary" | "outline" {
  switch (level) {
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "low":
      return "secondary";
    default:
      return "outline";
  }
}

/** Severity / impact string → Badge variant (same mapping as risk level). */
export const getSeverityVariant = getRiskBadgeVariant;

/** Numeric risk score → indicator color (Tailwind CSS class). */
export function getScoreColor(score: number): string {
  if (score > 70) return "bg-red-500";
  if (score > 40) return "bg-orange-500";
  return "bg-green-500";
}

/** Numeric risk score → hex color (for chart fills, map markers). */
export function getScoreHex(score: number): string {
  if (score > 70) return "#ef4444";
  if (score > 40) return "#f59e0b";
  return "#10b981";
}

/** Impact level → styled badge classes (background + text + border). */
export function getImpactClasses(impact: string): string {
  switch (impact) {
    case "high":
      return "text-red-600 bg-red-50 border-red-200";
    case "medium":
      return "text-orange-600 bg-orange-50 border-orange-200";
    default:
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
  }
}

/** Module name → color classes (background + text). */
export function getModuleColors(module: string): string {
  switch (module) {
    case "connect":
      return "bg-blue-100 text-blue-600";
    case "engage":
      return "bg-purple-100 text-purple-600";
    case "educate":
      return "bg-green-100 text-green-600";
    default:
      return "bg-indigo-100 text-indigo-600";
  }
}

/** Numeric risk score → styled badge classes (for network nodes, heatmaps). */
export function getScoreBadgeClasses(score: number): string {
  if (score > 70)
    return "bg-red-50 text-red-600 border-red-200";
  if (score > 30)
    return "bg-orange-50 text-orange-600 border-orange-200";
  return "bg-green-50 text-green-600 border-green-200";
}

/** Numeric risk score → risk level string. */
export function getRiskLevel(score: number): "high" | "medium" | "low" {
  if (score > 70) return "high";
  if (score > 30) return "medium";
  return "low";
}

/** Country name → geographic region. Used by supplier APIs. */
const REGION_MAP: Record<string, string> = {
  // Asia
  Vietnam: "Asia", Cambodia: "Asia", Bangladesh: "Asia", China: "Asia",
  India: "Asia", Indonesia: "Asia", Thailand: "Asia", Myanmar: "Asia",
  Philippines: "Asia", Malaysia: "Asia", Pakistan: "Asia", "Sri Lanka": "Asia",
  Taiwan: "Asia", Japan: "Asia", "South Korea": "Asia", Laos: "Asia", Nepal: "Asia",
  // Europe
  Germany: "Europe", France: "Europe", Italy: "Europe", Spain: "Europe",
  UK: "Europe", "United Kingdom": "Europe", Portugal: "Europe", Turkey: "Europe",
  Poland: "Europe", Romania: "Europe",
  // Americas
  USA: "Americas", "United States": "Americas", Mexico: "Americas",
  Brazil: "Americas", Colombia: "Americas", Guatemala: "Americas",
  Honduras: "Americas", "El Salvador": "Americas", Canada: "Americas",
  // Africa
  Ethiopia: "Africa", Kenya: "Africa", Madagascar: "Africa", Tanzania: "Africa",
  Mauritius: "Africa", "South Africa": "Africa", Egypt: "Africa",
  Morocco: "Africa", Tunisia: "Africa",
  // Middle East
  Jordan: "Middle East", UAE: "Middle East", "Saudi Arabia": "Middle East",
  // Oceania
  Australia: "Oceania",
};

export function deriveRegion(country: string | null): string {
  if (!country) return "Global";
  return REGION_MAP[country] || "Global";
}
