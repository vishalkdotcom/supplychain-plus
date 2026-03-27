"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchFramework } from "@/lib/api";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconScale, IconExternalLink } from "@tabler/icons-react";
import { RequirementList } from "@/components/governance/requirement-list";

interface PageProps {
  params: Promise<{ frameworkId: string }>;
}

const STATUS_BADGE: Record<string, { className: string; label: string }> = {
  compliant: { className: "bg-green-100 text-green-700 border-green-200", label: "Compliant" },
  partial: { className: "bg-amber-100 text-amber-700 border-amber-200", label: "Partial" },
  non_compliant: { className: "bg-red-100 text-red-700 border-red-200", label: "Non-Compliant" },
  not_assessed: { className: "bg-slate-100 text-slate-500 border-slate-200", label: "Not Assessed" },
};

export default function FrameworkDetailPage({ params }: PageProps) {
  const { frameworkId } = use(params);
  const id = parseInt(frameworkId);

  const { data, isLoading } = useQuery({
    queryKey: ["regulatory-framework", id],
    queryFn: () => fetchFramework(id),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-muted-foreground">Framework not found.</div>;
  }

  const { framework, requirements, suppliers } = data;

  const totalSuppliers = suppliers.length;
  const compliantCount = suppliers.filter((s) => s.status === "compliant").length;
  const complianceRate = totalSuppliers > 0 ? Math.round((compliantCount / totalSuppliers) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Control Center</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/governance/regulatory-radar">
              Regulatory Radar
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{framework.shortName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <IconScale className="w-6 h-6 text-indigo-500" />
            {framework.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="outline">{framework.jurisdiction}</Badge>
            {framework.effectiveDate && (
              <span className="text-sm text-muted-foreground">
                Effective: {new Date(framework.effectiveDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
            )}
            {framework.nextDeadline && (
              <Badge variant="secondary" className="text-xs">
                Next deadline: {new Date(framework.nextDeadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </Badge>
            )}
          </div>
          {framework.description && (
            <p className="text-sm text-muted-foreground mt-3 max-w-3xl">
              {framework.description}
            </p>
          )}
        </div>
        {framework.websiteUrl && (
          <a
            href={framework.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <IconExternalLink className="w-4 h-4" />
            Official source
          </a>
        )}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{requirements.length}</div>
            <div className="text-xs text-muted-foreground">Requirements</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{totalSuppliers}</div>
            <div className="text-xs text-muted-foreground">Suppliers Tracked</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{complianceRate}%</div>
            <div className="text-xs text-muted-foreground">Compliance Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Overall Progress</div>
            <Progress value={complianceRate} className="h-2 [&>div]:bg-indigo-500" />
            <div className="text-xs text-muted-foreground mt-1">
              {compliantCount} of {totalSuppliers} compliant
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="requirements">
        <TabsList>
          <TabsTrigger value="requirements">Requirements Checklist</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="requirements" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
              <CardDescription>
                {requirements.length} requirements grouped by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RequirementList requirements={requirements} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Compliance</CardTitle>
              <CardDescription>
                Compliance status for suppliers tracked under {framework.shortName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requirements</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Last Assessed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((s) => {
                    const badge = STATUS_BADGE[s.status] ?? STATUS_BADGE.not_assessed;
                    return (
                      <TableRow key={s.supplierId}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/suppliers/${s.supplierId}`}
                            className="hover:text-indigo-600 transition-colors"
                          >
                            {s.supplierName}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={badge.className}>
                            {badge.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {s.completedRequirements}/{s.totalRequirements}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Progress
                              value={s.percentage}
                              className="h-1.5 flex-1 [&>div]:bg-indigo-500"
                            />
                            <span className="text-xs text-muted-foreground w-8">
                              {s.percentage}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {s.lastAssessedAt
                            ? new Date(s.lastAssessedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                            : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
