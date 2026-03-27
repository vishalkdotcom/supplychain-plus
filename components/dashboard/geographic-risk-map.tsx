"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { IconMap } from "@tabler/icons-react";
import { VisualizationControls } from "./visualization-controls";
import { cn } from "@/lib/utils";
import { getScoreHex } from "@/lib/risk-utils";

// Use local world atlas TopoJSON file
const geoUrl = "/world-110m.json";

interface GeographicRiskMapProps {
  suppliers: Supplier[];
}

// Country centroid fallbacks — only used when real lat/lng is not available
const countryCentroids: Record<string, [number, number]> = {
  // Southeast Asia
  "Vietnam": [108.28, 14.06],
  "Cambodia": [104.99, 12.57],
  "Thailand": [100.99, 15.87],
  "Myanmar": [95.96, 21.91],
  "Philippines": [121.77, 12.88],
  "Malaysia": [101.98, 4.21],
  "Laos": [102.50, 19.86],
  "Singapore": [103.82, 1.35],
  "Timor-Leste": [125.73, -8.87],
  "Brunei": [114.73, 4.54],
  // South Asia
  "Bangladesh": [90.36, 23.69],
  "India": [78.96, 20.59],
  "Pakistan": [69.35, 30.38],
  "Sri Lanka": [80.77, 7.87],
  "Nepal": [84.12, 28.39],
  "Afghanistan": [67.71, 33.94],
  "Maldives": [73.22, 3.20],
  "Bhutan": [90.43, 27.51],
  // Central Asia
  "Uzbekistan": [64.59, 41.38],
  "Turkmenistan": [58.24, 38.97],
  "Kazakhstan": [66.92, 48.02],
  "Tajikistan": [71.28, 38.86],
  "Kyrgyzstan": [74.77, 41.20],
  "Mongolia": [103.85, 46.86],
  // East Asia
  "China": [104.20, 35.86],
  "Taiwan": [120.96, 23.69],
  "South Korea": [127.77, 35.91],
  "Japan": [138.25, 36.20],
  "Indonesia": [113.92, -0.79],
  "Hong Kong": [114.17, 22.32],
  // Middle East & Türkiye
  "Turkey": [35.24, 38.96],
  "Jordan": [36.24, 30.59],
  "United Arab Emirates": [53.85, 23.42],
  "Saudi Arabia": [45.08, 23.89],
  "Qatar": [51.18, 25.35],
  "Bahrain": [50.56, 26.07],
  "Kuwait": [47.48, 29.31],
  "Oman": [55.92, 21.51],
  "Iraq": [43.68, 33.22],
  "Iran": [53.69, 32.43],
  "Lebanon": [35.86, 33.87],
  "Israel": [34.85, 31.05],
  "Syria": [38.99, 34.80],
  "Yemen": [48.52, 15.55],
  // Africa
  "Ethiopia": [40.49, 9.15],
  "Kenya": [37.91, -0.02],
  "Tanzania": [34.89, -6.37],
  "Madagascar": [46.87, -18.77],
  "Mauritius": [57.55, -20.35],
  "Morocco": [-7.09, 31.79],
  "Egypt": [30.80, 26.82],
  "South Africa": [22.94, -30.56],
  "Nigeria": [8.68, 9.08],
  "Ghana": [-1.02, 7.95],
  "Tunisia": [9.54, 33.89],
  "Algeria": [1.66, 28.03],
  "Libya": [17.23, 26.34],
  "Senegal": [-14.45, 14.50],
  "Ivory Coast": [-5.55, 7.54],
  "Cameroon": [12.35, 7.37],
  "Democratic Republic of the Congo": [21.76, -4.04],
  "Republic of the Congo": [15.83, -0.23],
  "Uganda": [32.29, 1.37],
  "Rwanda": [29.87, -1.94],
  "Mozambique": [35.53, -18.67],
  "Zimbabwe": [29.15, -19.02],
  "Zambia": [27.85, -13.13],
  "Malawi": [34.30, -13.25],
  "Angola": [17.87, -11.20],
  "Botswana": [24.68, -22.33],
  "Namibia": [18.49, -22.96],
  "Lesotho": [28.23, -29.61],
  "Eswatini": [31.47, -26.52],
  // North America
  "United States": [-95.71, 37.09],
  "Canada": [-106.35, 56.13],
  // Central America & Caribbean
  "Mexico": [-102.55, 23.63],
  "Honduras": [-86.24, 15.20],
  "Guatemala": [-90.23, 15.78],
  "El Salvador": [-88.90, 13.79],
  "Nicaragua": [-85.21, 12.87],
  "Costa Rica": [-83.75, 9.75],
  "Panama": [-80.78, 8.54],
  "Haiti": [-72.29, 18.97],
  "Dominican Republic": [-70.16, 18.74],
  "Jamaica": [-77.30, 18.11],
  "Trinidad and Tobago": [-61.22, 10.69],
  "Cuba": [-77.78, 21.52],
  // South America
  "Colombia": [-74.30, 4.57],
  "Peru": [-75.02, -9.19],
  "Brazil": [-51.93, -14.24],
  "Argentina": [-63.62, -38.42],
  "Chile": [-71.54, -35.68],
  "Ecuador": [-78.18, -1.83],
  "Bolivia": [-63.59, -16.29],
  "Paraguay": [-58.44, -23.44],
  "Uruguay": [-55.77, -32.52],
  "Venezuela": [-66.59, 6.42],
  // Europe — Western
  "United Kingdom": [-3.44, 55.38],
  "Germany": [10.45, 51.17],
  "France": [2.21, 46.23],
  "Spain": [-3.75, 40.46],
  "Portugal": [-8.22, 39.40],
  "Italy": [12.57, 41.87],
  "Netherlands": [5.29, 52.13],
  "Belgium": [4.47, 50.50],
  "Switzerland": [8.23, 46.82],
  "Austria": [14.55, 47.52],
  "Ireland": [-8.24, 53.41],
  "Luxembourg": [6.13, 49.82],
  // Europe — Northern
  "Sweden": [18.64, 60.13],
  "Norway": [8.47, 60.47],
  "Denmark": [9.50, 56.26],
  "Finland": [25.75, 61.92],
  "Iceland": [-19.02, 64.96],
  // Europe — Eastern & Central
  "Poland": [19.15, 51.92],
  "Romania": [24.97, 45.94],
  "Bulgaria": [25.49, 42.73],
  "Czech Republic": [15.47, 49.82],
  "Hungary": [19.50, 47.16],
  "Slovakia": [19.70, 48.67],
  "Greece": [21.82, 39.07],
  "Croatia": [15.20, 45.10],
  "Serbia": [21.01, 44.02],
  "Ukraine": [31.17, 48.38],
  "Moldova": [28.37, 47.41],
  "Belarus": [27.95, 53.71],
  "Lithuania": [23.88, 55.17],
  "Latvia": [24.60, 56.88],
  "Estonia": [25.01, 58.60],
  "Slovenia": [14.99, 46.15],
  "Bosnia and Herzegovina": [17.68, 43.92],
  "North Macedonia": [21.75, 41.51],
  "Albania": [20.17, 41.15],
  "Kosovo": [20.90, 42.60],
  "Montenegro": [19.37, 42.71],
  // Oceania
  "Australia": [133.78, -25.27],
  "New Zealand": [174.89, -40.90],
  "Fiji": [178.07, -17.71],
  "Papua New Guinea": [143.96, -6.31],
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
  const router = useRouter();
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
            // Last resort: region-based fallback — log so developers can add missing countries
            if (process.env.NODE_ENV === "development") {
              console.warn(`[GeographicRiskMap] No centroid for country "${s.country}" (supplier: ${s.name})`);
            }
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
    <Card className="relative">
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
          isFullscreen ? "fixed inset-0 z-50 rounded-none bg-white p-4" : "h-[450px]"
        )}>
          <VisualizationControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleReset}
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen}
          />

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
                    onClick={() => router.push(`/suppliers/${marker.id}`)}
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
              <div className="text-[10px] mt-1 text-center" style={{ color: '#64748b' }}>Click to view supplier</div>
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
