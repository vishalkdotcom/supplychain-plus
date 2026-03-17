"use client";

import type { Case, Survey } from "@/types";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  IconMessage,
  IconChartBar,
  IconSchool,
  IconArrowRight,
  IconRobot,
  IconSparkles,
} from "@tabler/icons-react";
import { getSeverityVariant, getScoreColor } from "@/lib/risk-utils";

interface CrossModulePanelProps {
  cases: Case[];
  surveys: Survey[];
  training: {
    supplierId: string;
    courseId: string;
    courseName: string;
    enrolledWorkers: number;
    completedWorkers: number;
    completionRate: number;
    lastActivityDate: string;
  }[];
}

export function CrossModulePanel({
  cases,
  surveys,
  training,
}: CrossModulePanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Cross-Module Intelligence
        </CardTitle>
        <CardDescription>
          Cases, surveys, and training data linked to this supplier
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cases" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cases" className="gap-2">
              <IconMessage className="h-4 w-4" />
              Cases ({cases.length})
            </TabsTrigger>
            <TabsTrigger value="surveys" className="gap-2">
              <IconChartBar className="h-4 w-4" />
              Surveys ({surveys.length})
            </TabsTrigger>
            <TabsTrigger value="training" className="gap-2">
              <IconSchool className="h-4 w-4" />
              Training ({training.length})
            </TabsTrigger>
          </TabsList>

          {/* Cases Tab */}
          <TabsContent value="cases" className="space-y-3 mt-4">
            {cases.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No cases for this supplier
              </p>
            ) : (
              cases.map((c) => (
                <Link
                  key={c.id}
                  href={`/connect/${c.id}`}
                  className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{c.id}</span>
                        <Badge variant={getSeverityVariant(c.severity)}>
                          {c.severity}
                        </Badge>
                        <Badge variant="outline">{c.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{c.topic}</p>
                      <div className="flex items-start gap-2 mt-2">
                        <IconRobot className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {c.aiSummary}
                        </p>
                      </div>
                    </div>
                    <IconArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                  </div>
                </Link>
              ))
            )}
          </TabsContent>

          {/* Surveys Tab */}
          <TabsContent value="surveys" className="space-y-3 mt-4">
            {surveys.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No surveys for this supplier
              </p>
            ) : (
              surveys.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{s.title}</span>
                        <Badge variant="outline">{s.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {s.responses.toLocaleString()} responses • Risk Score:{" "}
                        <span
                          className={
                            s.riskScore > 70
                              ? "text-red-600 font-medium"
                              : "text-green-600 font-medium"
                          }
                        >
                          {s.riskScore}
                        </span>
                      </p>
                      <div className="flex items-start gap-2 mt-2">
                        <IconSparkles className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                          {s.aiInsight}
                        </p>
                      </div>
                      {s.themes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {s.themes.slice(0, 4).map((theme) => (
                            <Badge
                              key={theme.name}
                              variant={
                                theme.sentiment === "negative"
                                  ? "destructive"
                                  : theme.sentiment === "positive"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {theme.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-3 mt-4">
            {training.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No training data for this supplier
              </p>
            ) : (
              training.map((t) => (
                <div
                  key={t.courseId}
                  className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{t.courseName}</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t.completedWorkers.toLocaleString()} of{" "}
                        {t.enrolledWorkers.toLocaleString()} workers completed
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              t.completionRate < 50
                                ? "bg-red-500"
                                : t.completionRate < 75
                                ? "bg-orange-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${t.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {t.completionRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
