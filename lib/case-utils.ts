import type { Case } from "@/types";

/** Map SQL Server CaseStatusCultureText.Name to application status */
export function mapCaseStatus(status: string): Case["status"] {
  switch (status?.toLowerCase()) {
    case "open":
      return "new";
    case "in progress":
      return "in_progress";
    case "resolved":
      return "resolved";
    default:
      return "new";
  }
}
