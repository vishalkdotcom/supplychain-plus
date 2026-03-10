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
    const initialNodes: Node[] = [
      {
        id: "brand",
        type: "default",
        data: { label: "Main Brand (HQ)" },
        position: { x: 400, y: 50 },
        style: {
          background: "#4f46e5",
          color: "white",
          border: "none",
          fontWeight: "bold",
          padding: "10px 20px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        },
      },
    ];

    const initialEdges: Edge[] = [];

    // Let's create a simulated hierarchy based on regions
    const regions = Array.from(new Set(suppliers.map((s) => s.region))).filter(
      Boolean,
    );

    regions.forEach((region, rIdx) => {
      const regionId = `region-${region}`;
      const rX = 150 + rIdx * 250;
      const rY = 150;

      initialNodes.push({
        id: regionId,
        type: "default",
        data: { label: `${region} Hub` },
        position: { x: rX, y: rY },
        style: {
          background: "#f1f5f9",
          color: "#0f172a",
          border: "2px solid #cbd5e1",
          fontWeight: "bold",
          borderRadius: "8px",
        },
      });

      initialEdges.push({
        id: `edge-brand-${region}`,
        source: "brand",
        target: regionId,
        animated: true,
        style: { stroke: "#94a3b8", strokeWidth: 2 },
      });

      // Filter suppliers for this region and attach them
      const regionSuppliers = suppliers
        .filter((s) => s.region === region)
        .slice(0, 4); // Limit to 4 per region for neatness

      regionSuppliers.forEach((s, sIdx) => {
        const sX = rX - 100 + sIdx * 80;
        const sY = rY + 120 + (sIdx % 2) * 40; // Stagger vertically

        initialNodes.push({
          id: s.id,
          type: "supplier",
          data: { label: s.name, risk: s.riskScore },
          position: { x: sX, y: sY },
        });

        initialEdges.push({
          id: `edge-${region}-${s.id}`,
          source: regionId,
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
    });

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
          Visualize hierarchy, dependencies, and aggregated risk paths
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        <div 
          className="w-full bg-slate-50/50 rounded-xl overflow-hidden border border-slate-100 relative"
          style={{ height: '500px', minHeight: '500px', minWidth: '100%' }}
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
};

interface SupplierNodeData {
  label: string;
  risk: number;
}

// Custom Node to display a Supplier with a badge
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
