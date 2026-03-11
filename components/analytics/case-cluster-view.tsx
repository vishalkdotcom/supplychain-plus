"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconChartScatter3d, IconMessageReport } from "@tabler/icons-react";

interface CaseExample {
  id: string;
  text: string;
  company: string;
}

interface CaseCluster {
  id: number;
  name: string;
  count: number;
  latestCase: string;
  examples: CaseExample[];
}

export function CaseClusterView() {
  const [clusters, setClusters] = useState<CaseCluster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClusters() {
      try {
        const res = await fetch("/api/analytics/case-clusters");
        if (res.ok) {
          const json = await res.json();
          setClusters(json.clusters || []);
        }
      } catch (err) {
        console.error("Failed to fetch case clusters", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClusters();
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>AI Issue Clustering</CardTitle>
          <CardDescription>Auto-grouping similar cases using natural language embeddings...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (clusters.length === 0) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconChartScatter3d className="h-5 w-5 text-indigo-600" />
              AI Issue Clusters
            </CardTitle>
            <CardDescription>
              Unstructured grievance messages automatically grouped by semantic similarity
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            Powered by bge-m3 Embeddings
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clusters.map((cluster) => (
            <div key={cluster.id} className="flex flex-col border rounded-xl overflow-hidden bg-slate-50/50">
              <div className="p-4 border-b bg-white flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-slate-900 line-clamp-1" title={cluster.name}>
                    {cluster.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Last active: {new Date(cluster.latestCase).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0">{cluster.count} Cases</Badge>
              </div>
              
              <div className="p-4 flex-1 flex flex-col gap-3">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Example Messages</span>
                {cluster.examples.map((example, idx) => (
                  <div key={idx} className="text-sm bg-white p-3 rounded-lg border shadow-sm flex flex-col gap-2">
                    <p className="text-slate-700 italic">"{example.text}"</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs text-slate-400 font-mono">{example.id}</span>
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {example.company}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
