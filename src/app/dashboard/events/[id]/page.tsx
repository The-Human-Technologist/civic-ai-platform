"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  MapPin,
  Video,
} from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useEventStore } from "@/lib/data/event-store";
import {
  DISCLAIMER,
  EVENT_TYPE_LABELS,
  SEVERITY_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import { formatDateTime, formatConfidence } from "@/lib/format";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
import type { ReviewStatus } from "@/types";

export default function EventReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getEvent, updateEventStatus, hydrated } = useEventStore();
  const event = getEvent(decodeURIComponent(id));

  if (!hydrated) {
    return <DashboardLoading />;
  }

  if (!event) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-4 text-center">
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Event not found</AlertTitle>
          <AlertDescription>
            No detection with ID <span className="font-mono">{id}</span> exists in the demo dataset.
            It may have been reset or the link is outdated.
          </AlertDescription>
        </Alert>
        <LinkButton variant="outline" href="/dashboard/events">
          Back to detections
        </LinkButton>
      </div>
    );
  }

  function handleStatus(status: ReviewStatus) {
    updateEventStatus(event!.id, status);
    toast.success(`Event marked as ${STATUS_LABELS[status]}`);
    router.push("/dashboard/events");
  }

  function exportReport() {
    const report = {
      eventId: event!.id,
      type: EVENT_TYPE_LABELS[event!.type],
      location: event!.location,
      timestamp: event!.timestamp,
      severity: event!.severity,
      confidence: event!.confidence,
      description: event!.description,
      recommendedAction: event!.recommendedAction,
      disclaimer: DISCLAIMER,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event!.id}-evidence-report.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Evidence report downloaded");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <LinkButton variant="ghost" size="sm" className="w-fit" href="/dashboard/events">
        <ArrowLeft className="size-4" data-icon="inline-start" />
        Back to events
      </LinkButton>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {EVENT_TYPE_LABELS[event.type]}
          </h1>
          <Badge variant="outline">{event.id}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Event review — human verification required</p>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="size-4" />
        <AlertTitle>Assisted review only</AlertTitle>
        <AlertDescription>{DISCLAIMER}</AlertDescription>
      </Alert>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Event details</CardTitle>
          <CardDescription>AI-generated detection pending official review</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Location</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <MapPin className="size-4 text-primary" />
                {event.location.name}
              </p>
              <p className="text-xs text-muted-foreground">{event.location.area}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Timestamp</p>
              <p className="mt-1 text-sm font-medium">{formatDateTime(event.timestamp)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Severity</p>
              <Badge className="mt-1">{SEVERITY_LABELS[event.severity]}</Badge>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Confidence</p>
              <p className="mt-1 text-sm font-medium">{formatConfidence(event.confidence)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Current status</p>
              <p className="mt-1 text-sm">{STATUS_LABELS[event.status]}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Coordinates</p>
              <p className="mt-1 font-mono text-xs">
                {event.location.lat.toFixed(4)}, {event.location.lng.toFixed(4)}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-xs font-medium text-muted-foreground">AI description</p>
            <p className="mt-2 text-sm leading-relaxed">{event.description}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground">Recommended action</p>
            <p className="mt-2 text-sm leading-relaxed text-primary">{event.recommendedAction}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Evidence clip</CardTitle>
          <CardDescription>
            Placeholder — production would show blurred/masked video segment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-lg bg-slate-900 text-slate-400">
            <Video className="size-12" />
            <p className="text-sm">{event.evidenceLabel ?? "Evidence clip unavailable"}</p>
            <p className="text-xs text-slate-500">
              Face blurring &amp; plate masking applied on export (planned)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Reviewer actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Button onClick={() => handleStatus("confirmed")}>Confirm event</Button>
            <Button variant="outline" onClick={() => handleStatus("rejected")}>
              Reject false positive
            </Button>
            <Button variant="secondary" onClick={() => handleStatus("needs_field_verification")}>
              Mark as needs field verification
            </Button>
            <Button variant="outline" onClick={exportReport}>
              <Download className="size-4" data-icon="inline-start" />
              Export evidence report (mock JSON)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
