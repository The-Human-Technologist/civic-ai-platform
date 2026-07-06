"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LinkButton } from "@/components/ui/link-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEventStore } from "@/lib/data/event-store";
import {
  EVENT_TYPE_LABELS,
  SEVERITY_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import { formatDateTime, formatConfidence } from "@/lib/format";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
import { EVENT_TYPES, REVIEW_STATUSES, SEVERITIES } from "@/types";
import type { EventType, Severity } from "@/types";
import { cn } from "@/lib/utils";

const severityVariant: Record<Severity, "secondary" | "default" | "destructive" | "outline"> = {
  low: "secondary",
  medium: "outline",
  high: "default",
  critical: "destructive",
};

export default function EventsPage() {
  const { events, hydrated } = useEventStore();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState("");

  const locations = useMemo(
    () => [...new Set(events.map((e) => e.location.name))].sort(),
    [events],
  );

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (severityFilter !== "all" && e.severity !== severityFilter) return false;
      if (
        locationFilter &&
        !e.location.name.toLowerCase().includes(locationFilter.toLowerCase())
      )
        return false;
      return true;
    });
  }, [events, typeFilter, statusFilter, severityFilter, locationFilter]);

  if (!hydrated) return <DashboardLoading />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Events &amp; Detections</h1>
        <p className="text-sm text-muted-foreground">
          Human-reviewed civic and road safety detections from video analytics
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm lg:flex-row lg:flex-wrap lg:items-end">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Event type</label>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
            <SelectTrigger className="w-full min-w-[180px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {EVENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {EVENT_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-full min-w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {REVIEW_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Severity</label>
          <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v ?? "all")}>
            <SelectTrigger className="w-full min-w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {SEVERITIES.map((s) => (
                <SelectItem key={s} value={s}>
                  {SEVERITY_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Location</label>
          <Input
            placeholder="Filter by location…"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            list="locations-list"
            className="min-w-[200px]"
          />
          <datalist id="locations-list">
            {locations.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date / Time</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No events match filters
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs">{e.id}</TableCell>
                    <TableCell className="text-sm">{EVENT_TYPE_LABELS[e.type as EventType]}</TableCell>
                    <TableCell className="max-w-[140px] truncate text-sm">{e.location.name}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs">{formatDateTime(e.timestamp)}</TableCell>
                    <TableCell>{formatConfidence(e.confidence)}</TableCell>
                    <TableCell>
                      <Badge variant={severityVariant[e.severity]}>{SEVERITY_LABELS[e.severity]}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={cn("text-xs", e.status === "pending" && "font-medium text-amber-600")}>
                        {STATUS_LABELS[e.status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <LinkButton
                        size="sm"
                        variant="outline"
                        href={`/dashboard/events/${encodeURIComponent(e.id)}`}
                      >
                        Review
                      </LinkButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <p className="border-t px-4 py-2 text-xs text-muted-foreground">
          Showing {filtered.length} of {events.length} events
        </p>
      </div>
    </div>
  );
}
