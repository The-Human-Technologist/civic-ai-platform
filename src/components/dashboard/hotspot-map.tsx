"use client";

import type { Hotspot } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CATEGORY_STYLES: Record<Hotspot["category"], string> = {
  parking: "bg-amber-500",
  accident: "bg-red-500",
  pothole: "bg-orange-600",
  waterlogging: "bg-sky-500",
  congestion: "bg-violet-500",
};

/** Stylized map grid — replace with Mapbox/Leaflet + real coordinates in production */
export function HotspotMap({ hotspots }: { hotspots: Hotspot[] }) {
  const minLat = 22.708;
  const maxLat = 22.736;
  const minLng = 88.462;
  const maxLng = 88.494;

  function toPercent(lat: number, lng: number) {
    const top = ((maxLat - lat) / (maxLat - minLat)) * 100;
    const left = ((lng - minLng) / (maxLng - minLng)) * 100;
    return { top: `${top}%`, left: `${left}%` };
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Barasat Hotspot Map</CardTitle>
        <CardDescription>
          Simplified pilot visualization — production would use GIS integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mx-auto w-full max-w-3xl">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="absolute inset-0 opacity-30">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-300" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          <div className="absolute left-4 top-4 rounded-md bg-background/90 px-2 py-1 text-xs font-medium shadow">
            Barasat, North 24 Parganas
          </div>
          {hotspots.map((hs) => {
            const pos = toPercent(hs.location.lat, hs.location.lng);
            return (
              <div
                key={hs.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={pos}
              >
                <div
                  className={cn(
                    "relative flex size-8 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-lg ring-2 ring-white",
                    CATEGORY_STYLES[hs.category],
                  )}
                  style={{ transform: `scale(${0.8 + hs.intensity * 0.5})` }}
                >
                  {hs.eventCount}
                </div>
              </div>
            );
          })}
        </div>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {hotspots.map((hs) => (
            <div
              key={hs.id}
              className="flex flex-col gap-1 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className={cn("mt-1 size-3 shrink-0 rounded-full", CATEGORY_STYLES[hs.category])} />
                <div>
                  <p className="text-sm font-medium">{hs.label}</p>
                  <p className="text-xs text-muted-foreground">{hs.location.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{hs.description}</p>
                </div>
              </div>
              <Badge variant="secondary">{hs.eventCount} events</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
