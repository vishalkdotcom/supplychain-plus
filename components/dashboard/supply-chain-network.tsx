"use client";

import React, { useMemo, useState } from "react";
import { Brand, Supplier } from "@/types";
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
  Background,
  Node,
  Edge,
  MarkerType,
  Handle,
  Position,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Badge } from "@/components/ui/badge";
import { getScoreBadgeClasses } from "@/lib/risk-utils";
import { cn } from "@/lib/utils";
import { VisualizationControls } from "./visualization-controls";

interface SupplyChainNetworkProps {
  suppliers: Supplier[];
  brands: Brand[];
}

export function SupplyChainNetwork({ suppliers, brands }: SupplyChainNetworkProps) {
  const { nodes, edges } = useMemo(() => {
    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];

    // Build brand ID set for quick lookup
    const brandIds = new Set(brands.map((b) => b.id));

    // Map parentCompanyId → child suppliers
    const childMap = new Map<string, Supplier[]>();
    const standalone: Supplier[] = [];

    for (const s of suppliers) {
      if (s.parentCompanyId) {
        const children = childMap.get(s.parentCompanyId) || [];
        children.push(s);
        childMap.set(s.parentCompanyId, children);
      } else if (!brandIds.has(s.id)) {
        standalone.push(s);
      }
    }

    // WOVO Portfolio root node
    initialNodes.push({
      id: "root",
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
    const BRAND_Y = 150;
    const SUPPLIER_Y = 290;
    const CHILD_SPACING = 160;

    for (const brand of brands) {
      const children = childMap.get(brand.id) || [];
      const groupWidth = Math.max(children.length, 1) * CHILD_SPACING;
      const brandX = nodeX + groupWidth / 2;

      initialNodes.push({
        id: brand.id,
        type: "brand",
        data: {
          label: brand.name,
          risk: brand.avgRiskScore,
          childCount: children.length,
          country: brand.country || "",
        },
        position: { x: brandX, y: BRAND_Y },
      });

      initialEdges.push({
        id: `edge-root-${brand.id}`,
        source: "root",
        target: brand.id,
        animated: true,
        style: { stroke: "#94a3b8", strokeWidth: 2 },
      });

      children.forEach((child, cIdx) => {
        const cX = nodeX + cIdx * CHILD_SPACING;
        initialNodes.push({
          id: child.id,
          type: "supplier",
          data: { label: child.name, risk: child.riskScore },
          position: { x: cX, y: SUPPLIER_Y },
        });

        initialEdges.push({
          id: `edge-${brand.id}-${child.id}`,
          source: brand.id,
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

    for (const s of standalone) {
      initialNodes.push({
        id: s.id,
        type: "supplier",
        data: { label: s.name, risk: s.riskScore },
        position: { x: nodeX, y: SUPPLIER_Y },
      });

      initialEdges.push({
        id: `edge-root-standalone-${s.id}`,
        source: "root",
        target: s.id,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: "#cbd5e1",
        },
        style: { stroke: "#cbd5e1", strokeWidth: 1.5, strokeDasharray: "4,4" },
      });

      nodeX += CHILD_SPACING;
    }

    return { nodes: initialNodes, edges: initialEdges };
  }, [suppliers, brands]);

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconNetwork className="w-5 h-5 text-purple-500" />
          Supply Chain Network
        </CardTitle>
        <CardDescription>
          Brand hierarchy with aggregated risk scores
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        <ReactFlowProvider>
          <NetworkInner nodes={nodes} edges={edges} />
        </ReactFlowProvider>
      </CardContent>
    </Card>
  );
}

/** Inner component — uses useReactFlow() for zoom/pan control */
function NetworkInner({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => zoomIn({ duration: 200 });
  const handleZoomOut = () => zoomOut({ duration: 200 });
  const handleReset = () => fitView({ padding: 0.2, duration: 300 });
  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  return (
    <div
      className={cn(
        "w-full bg-slate-50/50 rounded-xl overflow-hidden border border-slate-100 relative transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 rounded-none bg-white p-4" : "h-[450px]"
      )}
    >
      <VisualizationControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
      />
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
      </ReactFlow>
    </div>
  );
}

const nodeTypes = {
  supplier: SupplierNode,
  brand: BrandNode,
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
          className={`mt-1 text-[10px] px-1 py-0 ${getScoreBadgeClasses(data.risk)}`}
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

interface BrandNodeData {
  label: string;
  risk: number;
  childCount: number;
  country: string;
}

function BrandNode({ data }: { data: BrandNodeData }) {
  return (
    <div className="px-5 py-3 shadow-lg rounded-lg bg-indigo-50 border-2 border-indigo-200">
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
          {data.childCount} supplier{data.childCount !== 1 ? "s" : ""}
          {data.country ? ` \u00b7 ${data.country}` : ""}
        </div>
        <Badge
          variant="outline"
          className={`mt-1 text-[10px] px-1.5 py-0 ${getScoreBadgeClasses(data.risk)}`}
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
