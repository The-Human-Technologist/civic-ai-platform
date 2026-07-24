"use client";

import {
  Activity,
  AlertTriangle,
  Car,
  CheckCircle,
  Clock,
  Droplets,
  MapPin,
  ParkingCircle,
  XCircle,
} from "lucide-react";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardPilotBanner } from "@/components/dashboard/pilot-banner";
import {
  EventsByTypeChart,
  ReviewStatusChart,
  WeeklyTrendChart,
} from "@/components/dashboard/charts";
import { useEventStore } from "@/lib/data/event-store";
import { LinkButton } from "@/components/ui/link-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EVENT_TYPE_LABELS, SEVERITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatRelative } from "@/lib/format";
import { PILOT_CORRIDOR } from "@/lib/constants";

export default function DashboardOverviewPage() {
  const { stats, events, hydrated } = useEventStore();

  if (!hydrated) {
    return <DashboardLoading />;
  }

  const recent = [...events]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  const reviewRate =
    events.length > 0
      ? Math.round(
          ((stats.confirmed + stats.rejected) / events.length) * 100,
        )
      : 0;

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <DashboardPilotBanner />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Operations Overview</h1>
          <p className="text-sm text-muted-foreground">
            {PILOT_CORRIDOR} — civic &amp; road safety analytics with mandatory human review
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton variant="outline" size="sm" href="/dashboard/map">
            Hotspot map
          </LinkButton>
          <LinkButton size="sm" href="/dashboard/events">
            Review queue ({stats.pendingReview})
          </LinkButton>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card px-4 py-3 shadow-sm">
          <p className="text-xs text-muted-foreground">Pilot status</p>
          <p className="mt-1 font-semibold text-emerald-700 dark:text-emerald-400">Week 2 — Active</p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3 shadow-sm">
          <p className="text-xs text-muted-foreground">Review completion</p>
          <p className="mt-1 font-semibold tabular-nums">{reviewRate}% of detections reviewed</p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3 shadow-sm">
          <p className="text-xs text-muted-foreground">CCTV feeds online</p>
          <p className="mt-1 font-semibold">2 synthetic scenarios · authorized upload ready</p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3 shadow-sm">
          <p className="text-xs text-muted-foreground">Enforcement mode</p>
          <p className="mt-1 font-semibold">Off — advisory only</p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Review queue
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Detections today" value={stats.eventsToday} icon={Activity} subtitle="Last 24 hours · pilot corridor" />
          <StatCard title="Pending review" value={stats.pendingReview} icon={Clock} accent="warning" subtitle="Awaiting municipal / traffic sign-off" />
          <StatCard title="Confirmed" value={stats.confirmed} icon={CheckCircle} accent="success" subtitle="Verified for field action" />
          <StatCard title="False positives" value={stats.rejected} icon={XCircle} subtitle="Rejected by reviewer" />
          <StatCard title="High-risk sites" value={stats.highRiskLocations} icon={MapPin} accent="danger" subtitle="High or critical severity" />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Corridor indicators
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard title="Congestion index" value={`${stats.avgCongestionScore}`} icon={Activity} subtitle="Colony More peak estimate /100" />
          <StatCard title="Helmet advisory" value={stats.helmetViolations} icon={AlertTriangle} subtitle="Non-compliance flags (review only)" />
          <StatCard title="Illegal parking" value={stats.illegalParking} icon={ParkingCircle} subtitle="Station Road & junction" />
          <StatCard title="Potholes flagged" value={stats.potholes} icon={Car} subtitle="PWD / municipality referral" />
          <StatCard title="Waterlogging" value={stats.waterloggingAlerts} icon={Droplets} accent="warning" subtitle="Drainage team alerts" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <EventsByTypeChart events={events} />
        <ReviewStatusChart
          pending={stats.pendingReview}
          confirmed={stats.confirmed}
          rejected={stats.rejected}
          needsField={events.filter((e) => e.status === "needs_field_verification").length}
        />
      </div>

      <WeeklyTrendChart events={events} />

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">Priority review queue</CardTitle>
            <CardDescription>Latest detections from Station Road &amp; Colony More feeds</CardDescription>
          </div>
          <LinkButton variant="outline" size="sm" href="/dashboard/events">
            Full detection log
          </LinkButton>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {recent.map((e) => (
              <div
                key={e.id}
                className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{EVENT_TYPE_LABELS[e.type]}</span>
                    <Badge variant="outline" className="font-mono text-[10px]">{e.id}</Badge>
                    <Badge variant={e.severity === "critical" || e.severity === "high" ? "destructive" : "secondary"} className="text-[10px]">
                      {SEVERITY_LABELS[e.severity]}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {e.location.name} · {formatRelative(e.timestamp)} · {STATUS_LABELS[e.status]}
                  </p>
                </div>
                <LinkButton
                  size="sm"
                  variant={e.status === "pending" ? "default" : "secondary"}
                  href={`/dashboard/events/${encodeURIComponent(e.id)}`}
                  className="shrink-0"
                >
                  Review
                </LinkButton>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
