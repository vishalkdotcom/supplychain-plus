"use client";

import React, { useMemo } from "react";
import { Supplier } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconNetwork } from "@tabler/icons-react";
import {
  ReactFlow,
  Controls,
  Background,
  Node,
  Edge,
  MarkerType,
  Handle,
  Position,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Badge } from "@/components/ui/badge";

interface SupplyChainNetworkProps {
  suppliers: Supplier[];
}

export function SupplyChainNetwork({ suppliers }: SupplyChainNetworkProps) {
  const { nodes, edges } = useMemo(() => {
    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];

    // Build real parent→child hierarchy from parentCompanyId
    const parentIds = new Set<string>();
    const childMap = new Map<string, Supplier[]>(); // parentId → children
    const orphans: Supplier[] = []; // suppliers with no parent

    for (const s of suppliers) {
      if (s.parentCompanyId) {
        parentIds.add(s.parentCompanyId);
        const children = childMap.get(s.parentCompanyId) || [];
        children.push(s);
        childMap.set(s.parentCompanyId, children);
      } else {
        orphans.push(s);
      }
    }

    // Find parent companies that are also suppliers (known parents)
    const knownParents = suppliers.filter((s) => parentIds.has(s.id));
    // Unknown parents (referenced but not in supplier list)
    const unknownParentIds = [...parentIds].filter(
      (pid) => !suppliers.find((s) => s.id === pid),
    );

    // Create brand node at top
    initialNodes.push({
      id: "brand",
      type: "default",
      data: { label: "WOVO Portfolio" },
      position: { x: 400, y: 30 },
      style: {
        background: "#4f46e5",
        color: "white",
        border: "none",
        fontWeight: "bold",
        padding: "10px 20px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      },
    });

    let nodeX = 0;
    const PARENT_Y = 150;
    const CHILD_Y = 290;
    const CHILD_SPACING = 160;

    // Render known parent companies with their children
    for (const parent of knownParents) {
      const children = childMap.get(parent.id) || [];
      const groupWidth = Math.max(children.length, 1) * CHILD_SPACING;
      const parentX = nodeX + groupWidth / 2;

      // Aggregated risk = weighted average of children's risk scores
      const aggregatedRisk =
        children.length > 0
          ? Math.round(
              children.reduce((sum, c) => sum + c.riskScore, 0) /
                children.length,
            )
          : parent.riskScore;

      initialNodes.push({
        id: parent.id,
        type: "parent",
        data: {
          label: parent.name,
          risk: aggregatedRisk,
          childCount: children.length,
          country: parent.country,
        },
        position: { x: parentX, y: PARENT_Y },
      });

      initialEdges.push({
        id: `edge-brand-${parent.id}`,
        source: "brand",
        target: parent.id,
        animated: true,
        style: { stroke: "#94a3b8", strokeWidth: 2 },
      });

      children.forEach((child, cIdx) => {
        const cX = nodeX + cIdx * CHILD_SPACING;
        initialNodes.push({
          id: child.id,
          type: "supplier",
          data: { label: child.name, risk: child.riskScore },
          position: { x: cX, y: CHILD_Y },
        });

        initialEdges.push({
          id: `edge-${parent.id}-${child.id}`,
          source: parent.id,
          target: child.id,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: "#cbd5e1",
          },
          style: { stroke: "#cbd5e1", strokeWidth: 1.5 },
        });
      });

      nodeX += groupWidth + 40;
    }

    // Render unknown parent groups
    for (const parentId of unknownParentIds) {
      const children = childMap.get(parentId) || [];
      const groupWidth = Math.max(children.length, 1) * CHILD_SPACING;
      const parentX = nodeX + groupWidth / 2;

      const aggregatedRisk = Math.round(
        children.reduce((sum, c) => sum + c.riskScore, 0) / children.length,
      );

      initialNodes.push({
        id: `parent-${parentId}`,
        type: "parent",
        data: {
          label: `Parent Group #${parentId}`,
          risk: aggregatedRisk,
          childCount: children.length,
          country: children[0]?.country || "Unknown",
        },
        position: { x: parentX, y: PARENT_Y },
      });

      initialEdges.push({
        id: `edge-brand-parent-${parentId}`,
        source: "brand",
        target: `parent-${parentId}`,
        animated: true,
        style: { stroke: "#94a3b8", strokeWidth: 2 },
      });

      children.forEach((child, cIdx) => {
        const cX = nodeX + cIdx * CHILD_SPACING;
        initialNodes.push({
          id: child.id,
          type: "supplier",
          data: { label: child.name, risk: child.riskScore },
          position: { x: cX, y: CHILD_Y },
        });

        initialEdges.push({
          id: `edge-parent-${parentId}-${child.id}`,
          source: `parent-${parentId}`,
          target: child.id,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: "#cbd5e1",
          },
          style: { stroke: "#cbd5e1", strokeWidth: 1.5 },
        });
      });

      nodeX += groupWidth + 40;
    }

    // Render orphan suppliers (no parent) — group by region
    const orphansByRegion = new Map<string, Supplier[]>();
    for (const s of orphans) {
      // Skip suppliers already rendered as known parents
      if (knownParents.find((p) => p.id === s.id)) continue;
      const region = s.region || "Other";
      const list = orphansByRegion.get(region) || [];
      list.push(s);
      orphansByRegion.set(region, list);
    }

    for (const [region, regionSuppliers] of orphansByRegion) {
      if (regionSuppliers.length === 0) continue;
      const groupWidth =
        Math.max(regionSuppliers.length, 1) * CHILD_SPACING;
      const regionX = nodeX + groupWidth / 2;

      const regionNodeId = `region-${region}`;
      const avgRisk = Math.round(
        regionSuppliers.reduce((sum, s) => sum + s.riskScore, 0) /
          regionSuppliers.length,
      );

      initialNodes.push({
        id: regionNodeId,
        type: "parent",
        data: {
          label: `${region}`,
          risk: avgRisk,
          childCount: regionSuppliers.length,
          country: region,
        },
        position: { x: regionX, y: PARENT_Y },
      });

      initialEdges.push({
        id: `edge-brand-${regionNodeId}`,
        source: "brand",
        target: regionNodeId,
        animated: true,
        style: { stroke: "#94a3b8", strokeWidth: 2, strokeDasharray: "5,5" },
      });

      regionSuppliers.slice(0, 6).forEach((s, sIdx) => {
        const sX = nodeX + sIdx * CHILD_SPACING;
        initialNodes.push({
          id: s.id,
          type: "supplier",
          data: { label: s.name, risk: s.riskScore },
          position: { x: sX, y: CHILD_Y },
        });

        initialEdges.push({
          id: `edge-${regionNodeId}-${s.id}`,
          source: regionNodeId,
          target: s.id,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: "#cbd5e1",
          },
          style: { stroke: "#cbd5e1", strokeWidth: 1.5 },
        });
      });

      nodeX += groupWidth + 40;
    }

    return { nodes: initialNodes, edges: initialEdges };
  }, [suppliers]);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconNetwork className="w-5 h-5 text-purple-500" />
          Supply Chain Network
        </CardTitle>
        <CardDescription>
          Corporate hierarchy with aggregated risk scores
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        <div
          className="w-full bg-slate-50/50 rounded-xl overflow-hidden border border-slate-100 relative"
          style={{ height: "500px", minHeight: "500px", minWidth: "100%" }}
        >
          <ReactFlowProvider>
            <ReactFlow
              defaultNodes={nodes}
              defaultEdges={edges}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              attributionPosition="bottom-right"
              style={{ width: "100%", height: "100%" }}
            >
              <Background color="#cbd5e1" gap={16} />
              <Controls />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </CardContent>
    </Card>
  );
}

const nodeTypes = {
  supplier: SupplierNode,
  parent: ParentNode,
};

interface SupplierNodeData {
  label: string;
  risk: number;
}

function SupplierNode({ data }: { data: SupplierNodeData }) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-slate-200">
      <Handle
        type="target"
        position={Position.Top}
        className="w-16 !bg-indigo-500"
      />
      <div className="flex flex-col items-center">
        <div className="text-sm font-bold truncate max-w-[120px] text-center">
          {data.label}
        </div>
        <Badge
          variant="outline"
          className={`mt-1 text-[10px] px-1 py-0 ${
            data.risk > 70
              ? "bg-red-50 text-red-600 border-red-200"
              : data.risk > 30
                ? "bg-orange-50 text-orange-600 border-orange-200"
                : "bg-green-50 text-green-600 border-green-200"
          }`}
        >
          Risk: {data.risk}
        </Badge>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-indigo-500"
      />
    </div>
  );
}

interface ParentNodeData {
  label: string;
  risk: number;
  childCount: number;
  country: string;
}

function ParentNode({ data }: { data: ParentNodeData }) {
  return (
    <div className="px-5 py-3 shadow-lg rounded-lg bg-slate-50 border-2 border-slate-300">
      <Handle
        type="target"
        position={Position.Top}
        className="w-16 !bg-indigo-500"
      />
      <div className="flex flex-col items-center">
        <div className="text-sm font-bold truncate max-w-[150px] text-center">
          {data.label}
        </div>
        <div className="text-[10px] text-muted-foreground mt-0.5">
          {data.childCount} supplier{data.childCount !== 1 ? "s" : ""} &middot;{" "}
          {data.country}
        </div>
        <Badge
          variant="outline"
          className={`mt-1 text-[10px] px-1.5 py-0 ${
            data.risk > 70
              ? "bg-red-50 text-red-600 border-red-200"
              : data.risk > 30
                ? "bg-orange-50 text-orange-600 border-orange-200"
                : "bg-green-50 text-green-600 border-green-200"
          }`}
        >
          Avg Risk: {data.risk}
        </Badge>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-indigo-500"
      />
    </div>
  );
}
