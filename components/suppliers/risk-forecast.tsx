"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";

interface ForecastData {
  currentScore: number;
  predictedScore: number;
  trend: "worsening" | "improving" | "stable";
  trendMagnitude: number;
  aiNarrative: string | null;
  forecastDate: string;
}

export function RiskForecast({ supplierId }: { supplierId: string }) {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchForecast() {
      try {
        const res = await fetch(`/api/suppliers/${supplierId}/forecast`);
        if (res.ok) {
          const data = await res.json();
          setForecast(data.forecast);
        }
      } catch (error) {
        console.error("Failed to fetch risk forecast:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchForecast();
  }, [supplierId]);

  if (loading || !forecast) {
    return null; // Silent render if no forecast data (e.g. not enough history yet)
  }

  const { trend, currentScore, predictedScore, trendMagnitude, aiNarrative } =
    forecast;

  let variant: "default" | "destructive" = "default";
  let Icon = Minus;
  let customClass = "";

  if (trend === "worsening") {
    variant = "destructive";
    Icon = TrendingUp; // score goes up = risk goes up
  } else if (trend === "improving") {
    variant = "default";
    customClass = "border-green-500/50 text-green-700 dark:border-green-500/30 dark:text-green-400";
    Icon = TrendingDown;
  }

  return (
    <Alert variant={variant} className={`mb-6 flex items-start gap-4 ${customClass}`}>
      {variant === "destructive" ? (
        <AlertTriangle className="h-5 w-5 mt-0.5" />
      ) : (
        <Icon className="h-5 w-5 mt-0.5" />
      )}
      <div className="flex-1">
        <AlertTitle className="text-base font-semibold flex items-center gap-2">
          60-Day Risk Forecast: {trend.charAt(0).toUpperCase() + trend.slice(1)}
          <span className="text-sm font-normal opacity-80 border-l pl-2 ml-2">
            Current: {currentScore} → Predicted: {predictedScore} ({trendMagnitude > 0 ? "+" : ""}{trendMagnitude.toFixed(1)}%)
          </span>
        </AlertTitle>
        <AlertDescription className="mt-1 text-sm leading-relaxed">
          {aiNarrative ? (
            <span className="italic">"{aiNarrative}"</span>
          ) : (
            `The risk score is trending ${trend} over the next 60 days based on historical patterns.`
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
}
