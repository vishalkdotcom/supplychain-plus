"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconChevronDown,
  IconChevronRight,
  IconAlertCircle,
  IconWand,
} from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Anomaly {
  id: number;
  payslipId: string;
  supplierId: string;
  supplierName: string;
  country: string;
  anomalyType: string;
  severity: "critical" | "warning" | "info";
  actualWage: number;
  expectedWage: number;
  deviationPercent: number;
  aiExplanation: string | null;
  detectedAt: string;
}

export function PayslipAnomalyTable() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/analytics/payslip-anomalies");
        if (res.ok) {
          const data = await res.json();
          setAnomalies(data.anomalies);
        }
      } catch (err) {
        console.error("Failed to fetch anomalies", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payslip Anomalies</CardTitle>
        </CardHeader>
        <CardContent className="h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (anomalies.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconAlertCircle className="h-5 w-5 text-red-500" />
          Detected Payslip Anomalies
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Actual Wage</TableHead>
                <TableHead className="text-right">Regional Avg</TableHead>
                <TableHead className="text-right">Deviation</TableHead>
                <TableHead>Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {anomalies.map((anomaly) => (
                <React.Fragment key={anomaly.id}>
                  <TableRow
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      setExpandedId(expandedId === anomaly.id ? null : anomaly.id)
                    }
                  >
                    <TableCell>
                      {expandedId === anomaly.id ? (
                        <IconChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <IconChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {anomaly.supplierName}
                    </TableCell>
                    <TableCell>{anomaly.country}</TableCell>
                    <TableCell className="text-right font-mono">
                      ${anomaly.actualWage}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground font-mono">
                      ${anomaly.expectedWage}
                    </TableCell>
                    <TableCell className="text-right text-red-600 font-medium">
                      {anomaly.deviationPercent}%
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          anomaly.severity === "critical"
                            ? "destructive"
                            : "outline"
                        }
                        className={
                          anomaly.severity === "warning"
                            ? "border-orange-500 text-orange-600"
                            : ""
                        }
                      >
                        {anomaly.severity}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  {expandedId === anomaly.id && anomaly.aiExplanation && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={7} className="p-4">
                        <div className="flex gap-3 text-sm text-indigo-900 bg-indigo-50 p-4 rounded-md border border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-200 dark:border-indigo-900">
                          <IconWand className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                          <div className="leading-relaxed">
                            <span className="font-semibold block mb-1">AI Audit Explanation</span>
                            {anomaly.aiExplanation}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
