"use client";

import { HotspotMap } from "@/components/dashboard/hotspot-map";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
import { useEventStore } from "@/lib/data/event-store";

export default function MapPage() {
  const { hotspots, hydrated } = useEventStore();

  if (!hydrated) return <DashboardLoading />;

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hotspot Map</h1>
        <p className="text-sm text-muted-foreground">
          High-risk locations around Barasat from aggregated human-reviewed detections
        </p>
      </div>
      <HotspotMap hotspots={hotspots} />
    </div>
  );
}
