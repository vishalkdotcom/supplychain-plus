"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { FrameworkOverview, SupplierComplianceSummary } from "@/types";

interface ComplianceMatrixProps {
  frameworks: FrameworkOverview[];
  compliance: SupplierComplianceSummary[];
}

const STATUS_STYLES: Record<string, { bg: string; label: string }> = {
  compliant: { bg: "bg-green-500", label: "Compliant" },
  partial: { bg: "bg-amber-400", label: "Partial" },
  non_compliant: { bg: "bg-red-500", label: "Non-Compliant" },
  not_assessed: { bg: "bg-slate-200", label: "Not Assessed" },
};

export function ComplianceMatrix({ frameworks, compliance }: ComplianceMatrixProps) {
  // Group compliance by supplier
  const supplierMap = new Map<string, { name: string; byFramework: Map<number, SupplierComplianceSummary> }>();
  for (const c of compliance) {
    if (!supplierMap.has(c.supplierId)) {
      supplierMap.set(c.supplierId, { name: c.supplierName, byFramework: new Map() });
    }
    supplierMap.get(c.supplierId)!.byFramework.set(c.frameworkId, c);
  }

  const suppliers = [...supplierMap.entries()].slice(0, 25);

  if (suppliers.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        No compliance data available. Run the seed script to populate.
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px]">Supplier</TableHead>
              {frameworks.map((fw) => (
                <TableHead key={fw.id} className="text-center min-w-[80px]">
                  <Link
                    href={`/governance/regulatory-radar/${fw.id}`}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    {fw.shortName}
                  </Link>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map(([supplierId, data]) => (
              <TableRow key={supplierId}>
                <TableCell className="font-medium text-sm">
                  <Link
                    href={`/suppliers/${supplierId}`}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    {data.name}
                  </Link>
                </TableCell>
                {frameworks.map((fw) => {
                  const entry = data.byFramework.get(fw.id);
                  const status = entry?.status ?? "not_assessed";
                  const style = STATUS_STYLES[status] ?? STATUS_STYLES.not_assessed;

                  return (
                    <TableCell key={fw.id} className="text-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-6 h-6 rounded-full mx-auto ${style.bg} ${status === "not_assessed" ? "" : "ring-1 ring-white shadow-sm"}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <div className="font-medium">{style.label}</div>
                            {entry && entry.totalRequirements > 0 && (
                              <div className="text-muted-foreground">
                                {entry.completedRequirements}/{entry.totalRequirements} requirements
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
