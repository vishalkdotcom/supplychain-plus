"use client";

import React, { useMemo, useState } from "react";
import { Supplier } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { IconMap, IconMinus, IconPlus, IconRefresh, IconMaximize, IconMinimize } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getScoreHex } from "@/lib/risk-utils";

// Use local world atlas TopoJSON file
const geoUrl = "/world-110m.json";

interface GeographicRiskMapProps {
  suppliers: Supplier[];
}

// Country centroid fallbacks — only used when real lat/lng is not available
const countryCentroids: Record<string, [number, number]> = {
  "Vietnam": [108.28, 14.06],
  "Bangladesh": [90.36, 23.69],
  "China": [104.20, 35.86],
  "India": [78.96, 20.59],
  "Cambodia": [104.99, 12.57],
  "Indonesia": [113.92, -0.79],
  "Turkey": [35.24, 38.96],
  "Mexico": [-102.55, 23.63],
  "Taiwan": [120.96, 23.69],
  "Thailand": [100.99, 15.87],
  "Myanmar": [95.96, 21.91],
  "Pakistan": [69.35, 30.38],
  "Sri Lanka": [80.77, 7.87],
  "Ethiopia": [40.49, 9.15],
  "Honduras": [-86.24, 15.20],
  "Guatemala": [-90.23, 15.78],
};

// Small offset for suppliers sharing the same coordinates
const getOffset = (str: string, index: number) => {
  let hash = index;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const x = (Math.abs(hash) % 40) / 10 - 2;
  const y = ((Math.abs(hash) >> 2) % 40) / 10 - 2;
  return [x, y];
};

interface TooltipState {
  content: {
    name: string;
    country: string;
    riskScore: number;
  };
  x: number;
  y: number;
}

export function GeographicRiskMap({ suppliers }: GeographicRiskMapProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [position, setPosition] = useState({ coordinates: [20, 15] as [number, number], zoom: 1 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => {
    if (position.zoom >= 40) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleReset = () => {
    setPosition({ coordinates: [20, 15], zoom: 1 });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const mapData = useMemo(() => {
    return suppliers
      .map((s, i) => {
        // Use real lat/lng from database if available
        let coords: [number, number];
        let hasRealCoords = false;

        if (s.longitude != null && s.latitude != null) {
          coords = [s.longitude, s.latitude];
          hasRealCoords = true;
        } else {
          // Fallback to country centroid
          const centroid = countryCentroids[s.country];
          if (centroid) {
            const offset = getOffset(s.id, i);
            coords = [centroid[0] + offset[0], centroid[1] + offset[1]];
          } else {
            // Last resort: region-based fallback
            if (s.region?.includes("Asia")) coords = [100 + i * 0.5, 20];
            else if (s.region?.includes("Europe")) coords = [15 + i * 0.5, 50];
            else if (s.region?.includes("America")) coords = [-90 + i * 0.5, 15];
            else coords = [0, 0];
          }
        }

        const color = getScoreHex(s.riskScore);

        return {
          ...s,
          coordinates: coords,
          color,
          hasRealCoords,
        };
      })
      .filter((s) => s.coordinates[0] !== 0 || s.coordinates[1] !== 0);
  }, [suppliers]);

  return (
    <Card className="col-span-full xl:col-span-2 relative">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconMap className="w-5 h-5 text-indigo-500" />
          Geographic Risk Heatmap
        </CardTitle>
        <CardDescription>
          Global distribution of supplier risk and case density
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        <div className={cn(
          "bg-slate-50/50 rounded-xl overflow-hidden border border-slate-100 relative transition-all duration-300",
          isFullscreen ? "fixed inset-0 z-50 rounded-none bg-white p-4" : "h-[400px]"
        )}>
          {/* Controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <div className="flex flex-col bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none border-b border-slate-100"
                onClick={handleZoomIn}
                title="Zoom In"
              >
                <IconPlus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={handleZoomOut}
                title="Zoom Out"
              >
                <IconMinus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-white/80 backdrop-blur-sm shadow-sm"
              onClick={handleReset}
              title="Reset View"
            >
              <IconRefresh className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-white/80 backdrop-blur-sm shadow-sm"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <IconMinimize className="h-4 w-4" /> : <IconMaximize className="h-4 w-4" />}
            </Button>
          </div>

          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 120,
            }}
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup 
              center={position.coordinates} 
              zoom={position.zoom} 
              onMoveEnd={(pos) => setPosition({ coordinates: pos.coordinates as [number, number], zoom: pos.zoom })}
              minZoom={1} 
              maxZoom={40}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#e2e8f0"
                      stroke="#cbd5e1"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "#cbd5e1", outline: "none" },
                        pressed: { fill: "#94a3b8", outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>

              {mapData.map((marker) => (
                <Marker key={marker.id} coordinates={marker.coordinates}>
                  <circle
                    r={(marker.riskScore > 70 ? 6 : 4) / Math.sqrt(position.zoom)}
                    fill={marker.color}
                    fillOpacity={0.8}
                    stroke="#ffffff"
                    strokeWidth={1.5 / Math.pow(position.zoom, 0.5)}
                    style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                    onMouseEnter={(e) => {
                      const rect = (e.target as SVGElement).getBoundingClientRect();
                      setTooltip({
                        content: {
                          name: marker.name,
                          country: marker.country,
                          riskScore: marker.riskScore
                        },
                        x: rect.x + rect.width / 2,
                        y: rect.y
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                  {marker.riskScore > 70 && (
                    <circle
                      r={10 / Math.sqrt(position.zoom)}
                      fill={marker.color}
                      fillOpacity={0.2}
                      className="animate-pulse"
                      style={{ pointerEvents: "none" }}
                    />
                  )}
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>
          
          {/* Custom Tooltip */}
          {tooltip && (
            <div 
              className="fixed z-50 pointer-events-none px-3 py-2 rounded-lg shadow-xl text-sm border border-slate-700 animate-in fade-in zoom-in-95 duration-100"
              style={{
                backgroundColor: '#0f172a',
                color: 'white',
                left: `${tooltip.x}px`,
                top: `${tooltip.y - 12}px`,
                transform: 'translate(-50%, -100%)'
              }}
            >
              <div className="font-semibold">{tooltip.content.name}</div>
              <div className="flex items-center justify-between gap-4 mt-1 text-xs" style={{ color: '#cbd5e1' }}>
                <span>{tooltip.content.country}</span>
                <span className="font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>
                  Risk: {tooltip.content.riskScore}
                </span>
              </div>
              <div 
                className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 border-b border-r border-slate-700 rotate-45" 
                style={{ backgroundColor: '#0f172a' }}
              ></div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-sm" />
            High Risk (&gt;70)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 border border-white shadow-sm" />
            Medium Risk (31-70)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-sm" />
            Low Risk (0-30)
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
