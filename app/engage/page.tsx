"use client";

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
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconSparkles, IconPencilPlus } from "@tabler/icons-react";
import { MOCK_SURVEYS } from "@/lib/mock-data";

export default function EngagePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Engage Insights</h1>
          <p className="text-muted-foreground">
            Survey analysis and effortless design.
          </p>
        </div>
        <Button className="gap-2">
          <IconPencilPlus className="w-4 h-4" />
          Design New Survey
        </Button>
      </div>

      <div className="flex gap-4">
        <Card className="flex-1 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-100 dark:border-indigo-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconSparkles className="w-5 h-5 text-indigo-500" />
              AI Designer
            </CardTitle>
            <CardDescription>
              Type a topic to generate a survey instantly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input placeholder="E.g., 'Fire safety awareness for Vietnam factories'..." />
              <Button variant="secondary">Generate</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Surveys</CardTitle>
          <CardDescription>
            Performance and risk analysis of deployed surveys.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead className="w-[400px]">AI Insight</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_SURVEYS.map((survey) => (
                <TableRow key={survey.id}>
                  <TableCell className="font-medium">{survey.id}</TableCell>
                  <TableCell>{survey.title}</TableCell>
                  <TableCell>{survey.responses}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        survey.risk_score > 50 ? "destructive" : "outline"
                      }
                    >
                      {survey.risk_score}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 items-start">
                      <IconSparkles className="w-4 h-4 mt-1 text-purple-500 shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {survey.ai_insight}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{survey.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Analyze
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
