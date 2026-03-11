"use client";

import React, { useMemo } from "react";
import { Supplier } from "@/types";
import { HierarchyRelation } from "@/lib/api";
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
  hierarchy?: HierarchyRelation[];
}

export function SupplyChainNetwork({ suppliers, hierarchy }: SupplyChainNetworkProps) {
  const { nodes, edges } = useMemo(() => {
    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];

    // Build a supplier lookup by client_key (id)
    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

    // Try to use real hierarchy data if available
    if (hierarchy && hierarchy.length > 0) {
      // Deduplicate hierarchy entries that reference suppliers in our dataset
      const relevantHierarchy = hierarchy.filter(
        (h) => supplierMap.has(h.parentClientKey) || supplierMap.has(h.childClientKey)
      );

      if (relevantHierarchy.length > 0) {
        // Build parent groups: parentKey -> children[]
        const parentGroups = new Map<string, { name: string; children: { key: string; name: string }[] }>();

        for (const h of relevantHierarchy) {
          if (!parentGroups.has(h.parentClientKey)) {
            parentGroups.set(h.parentClientKey, { name: h.parentName, children: [] });
          }
          parentGroups.get(h.parentClientKey)!.children.push({
            key: h.childClientKey,
            name: h.childName,
          });
        }

        // Track which suppliers are placed so we can add orphans by region
        const placedSupplierIds = new Set<string>();

        // Add a brand HQ node
        initialNodes.push({
          id: "brand",
          type: "default",
          data: { label: "WOVO Platform" },
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

        let groupIndex = 0;
        for (const [parentKey, group] of parentGroups) {
          const parentId = `parent-${parentKey}`;
          const pX = 100 + groupIndex * 280;
          const pY = 140;

          // Parent node — may or may not be a supplier itself
          const parentSupplier = supplierMap.get(parentKey);
          if (parentSupplier) {
            initialNodes.push({
              id: parentKey,
              type: "supplier",
              data: { label: parentSupplier.name, risk: parentSupplier.riskScore },
              position: { x: pX, y: pY },
            });
            placedSupplierIds.add(parentKey);
            initialEdges.push({
              id: `edge-brand-${parentKey}`,
              source: "brand",
              target: parentKey,
              animated: true,
              style: { stroke: "#94a3b8", strokeWidth: 2 },
            });
          } else {
            // Parent is a group hub not in our supplier list
            initialNodes.push({
              id: parentId,
              type: "default",
              data: { label: group.name },
              position: { x: pX, y: pY },
              style: {
                background: "#f1f5f9",
                color: "#0f172a",
                border: "2px solid #cbd5e1",
                fontWeight: "bold",
                borderRadius: "8px",
              },
            });
            initialEdges.push({
              id: `edge-brand-${parentId}`,
              source: "brand",
              target: parentId,
              animated: true,
              style: { stroke: "#94a3b8", strokeWidth: 2 },
            });
          }

          const sourceId = parentSupplier ? parentKey : parentId;

          // Add children
          group.children.forEach((child, cIdx) => {
            const childSupplier = supplierMap.get(child.key);
            const cX = pX - 60 + cIdx * 100;
            const cY = pY + 130 + (cIdx % 2) * 40;

            if (childSupplier) {
              initialNodes.push({
                id: child.key,
                type: "supplier",
                data: { label: childSupplier.name, risk: childSupplier.riskScore },
                position: { x: cX, y: cY },
              });
              placedSupplierIds.add(child.key);
            } else {
              initialNodes.push({
                id: `child-${child.key}`,
                type: "default",
                data: { label: child.name },
                position: { x: cX, y: cY },
                style: {
                  background: "#ffffff",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "12px",
                },
              });
            }

            initialEdges.push({
              id: `edge-${sourceId}-${child.key}`,
              source: sourceId,
              target: childSupplier ? child.key : `child-${child.key}`,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
                color: "#cbd5e1",
              },
              style: { stroke: "#cbd5e1", strokeWidth: 1.5 },
            });
          });

          groupIndex++;
        }

        // Add orphan suppliers (not in any hierarchy) grouped by region
        const orphans = suppliers.filter((s) => !placedSupplierIds.has(s.id));
        if (orphans.length > 0) {
          const orphanRegions = Array.from(new Set(orphans.map((s) => s.region))).filter(Boolean);
          orphanRegions.forEach((region, rIdx) => {
            const regionId = `region-${region}`;
            const rX = 100 + (groupIndex + rIdx) * 280;
            const rY = 140;

            initialNodes.push({
              id: regionId,
              type: "default",
              data: { label: `${region}` },
              position: { x: rX, y: rY },
              style: {
                background: "#f1f5f9",
                color: "#0f172a",
                border: "2px dashed #cbd5e1",
                fontWeight: "bold",
                borderRadius: "8px",
              },
            });
            initialEdges.push({
              id: `edge-brand-${regionId}`,
              source: "brand",
              target: regionId,
              animated: true,
              style: { stroke: "#94a3b8", strokeWidth: 2 },
            });

            orphans
              .filter((s) => s.region === region)
              .slice(0, 4)
              .forEach((s, sIdx) => {
                const sX = rX - 60 + sIdx * 90;
                const sY = rY + 130 + (sIdx % 2) * 40;
                initialNodes.push({
                  id: s.id,
                  type: "supplier",
                  data: { label: s.name, risk: s.riskScore },
                  position: { x: sX, y: sY },
                });
                initialEdges.push({
                  id: `edge-${regionId}-${s.id}`,
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
        }

        return { nodes: initialNodes, edges: initialEdges };
      }
    }

    // Fallback: region-based grouping (when no hierarchy data)
    initialNodes.push({
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
    });

    const regions = Array.from(new Set(suppliers.map((s) => s.region))).filter(Boolean);

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

      const regionSuppliers = suppliers
        .filter((s) => s.region === region)
        .slice(0, 4);

      regionSuppliers.forEach((s, sIdx) => {
        const sX = rX - 100 + sIdx * 80;
        const sY = rY + 120 + (sIdx % 2) * 40;

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
  }, [suppliers, hierarchy]);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconNetwork className="w-5 h-5 text-purple-500" />
          Supply Chain Network
        </CardTitle>
        <CardDescription>
          {hierarchy && hierarchy.length > 0
            ? "Real parent-child hierarchy from company relationships"
            : "Visualize hierarchy, dependencies, and aggregated risk paths"}
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
