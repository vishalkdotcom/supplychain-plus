"use client";

import { useState } from "react";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconRobot } from "@tabler/icons-react";
import { MOCK_CASES } from "@/lib/mock-data";

export default function ConnectPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Connect Intelligence
        </h1>
        <p className="text-muted-foreground">
          AI-powered case management and triage.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Inbox</CardTitle>
          <CardDescription>
            Recent cases requiring attention. AI has auto-tagged severity and
            provided summaries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="w-[400px]">AI Summary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_CASES.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell className="font-medium">{issue.id}</TableCell>
                  <TableCell>{issue.topic}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        issue.severity === "High"
                          ? "destructive"
                          : issue.severity === "Medium"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {issue.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 items-start">
                      <IconRobot className="w-4 h-4 mt-1 text-indigo-500 shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {issue.ai_summary}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{issue.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      View Details
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
