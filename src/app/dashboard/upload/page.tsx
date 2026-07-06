"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Camera, CheckCircle2, Loader2, Upload, Video } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DEMO_FEEDS } from "@/lib/data/locations";
import { getSyntheticUploadDemos } from "@/lib/demo-footage";
import {
  processVideoMock,
  simulateUploadProgress,
} from "@/lib/mock-ai/processor";
import { useEventStore } from "@/lib/data/event-store";
import type { ProcessingStage } from "@/types";
import { DISCLAIMER, DEMO_DATA_NOTICE } from "@/lib/constants";

const STAGE_PROGRESS: Record<ProcessingStage, number> = {
  idle: 0,
  uploading: 35,
  processing: 70,
  complete: 100,
  error: 0,
};

const STAGE_LABELS: Record<ProcessingStage, string> = {
  idle: "Ready",
  uploading: "Uploading…",
  processing: "AI processing…",
  complete: "Detections generated",
  error: "Error",
};

export default function UploadPage() {
  const { addEvents } = useEventStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{
    count: number;
    frames: number;
    ms: number;
  } | null>(null);
  const [activeFeed, setActiveFeed] = useState<string | null>(null);
  const [activeDemoFootage, setActiveDemoFootage] = useState<string | null>(null);
  const syntheticDemos = getSyntheticUploadDemos();

  const runPipeline = useCallback(
    async (source: {
      fileName?: string;
      feedId?: string;
      fileSize?: number;
      demoFootageId?: string;
    }) => {
      try {
        setStage("uploading");
        if (source.fileSize) {
          await simulateUploadProgress(() => setStage("uploading"), source.fileSize);
        } else {
          await new Promise((r) => setTimeout(r, 600));
        }
        setStage("processing");
        const result = await processVideoMock({
          fileName: source.fileName,
          feedId: source.feedId,
          demoFootageId: source.demoFootageId,
        });
        addEvents(result.events);
        setLastResult({
          count: result.events.length,
          frames: result.framesAnalyzed,
          ms: result.processingMs,
        });
        setStage("complete");
        toast.success(`${result.events.length} detections generated for human review`);
      } catch {
        setStage("error");
        toast.error("Processing failed — please retry");
      }
    },
    [addEvents],
  );

  async function handleFileChange(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }
    setFileName(file.name);
    setActiveFeed(null);
    setActiveDemoFootage(null);
    setLastResult(null);
    await runPipeline({ fileName: file.name, fileSize: file.size });
  }

  async function handleDemoFeed(feedId: string, name: string) {
    setActiveFeed(feedId);
    setActiveDemoFootage(null);
    setFileName(name);
    setLastResult(null);
    setStage("uploading");
    await runPipeline({ feedId, fileName: name });
  }

  async function handleSyntheticDemoFootage(demoFootageId: string, title: string) {
    setActiveDemoFootage(demoFootageId);
    setActiveFeed(null);
    setFileName(title);
    setLastResult(null);
    setStage("uploading");
    await runPipeline({ demoFootageId, fileName: title });
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Video Upload &amp; Demo Feeds</h1>
        <p className="text-sm text-muted-foreground">
          Upload CCTV footage or select Barasat pilot demo feeds. AI detections are simulated for MVP.
        </p>
      </div>

      <Badge variant="outline" className="w-fit border-amber-500/60 bg-amber-500/5 text-amber-900 dark:text-amber-200">
        Demo mode: uploaded files are not processed by real AI in this MVP. Detections are synthetic.
        Use only licensed or authorized footage.
      </Badge>

      <Alert>
        <Video className="size-4" />
        <AlertTitle>Existing footage analytics</AlertTitle>
        <AlertDescription>
          Works with uploaded video files. Production would connect RTSP CCTV streams. {DISCLAIMER}
        </AlertDescription>
      </Alert>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Upload video file</CardTitle>
          <CardDescription>MP4, WebM, or MOV — processed locally in demo mode</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          <div
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-muted/30 p-10 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileChange(e.dataTransfer.files[0] ?? null);
            }}
          >
            <Upload className="size-10 text-muted-foreground" />
            <p className="text-sm font-medium">Drag &amp; drop video or click to browse</p>
            <Button
              variant="secondary"
              disabled={stage === "uploading" || stage === "processing"}
              onClick={() => fileInputRef.current?.click()}
            >
              Select video
            </Button>
          </div>

          {(stage !== "idle" || fileName) && (
            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">{fileName ?? "Processing…"}</span>
                <span className="text-muted-foreground">{STAGE_LABELS[stage]}</span>
              </div>
              <Progress value={STAGE_PROGRESS[stage]} className="h-2" />
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant={stage === "uploading" || stage === "processing" || stage === "complete" ? "default" : "outline"}>
                  {stage === "uploading" || stage === "processing" ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
                  Uploading
                </Badge>
                <Badge variant={stage === "processing" || stage === "complete" ? "default" : "outline"}>
                  {stage === "processing" ? <Loader2 className="size-3 animate-spin" /> : null}
                  Processing
                </Badge>
                <Badge variant={stage === "complete" ? "default" : "outline"}>Detections generated</Badge>
              </div>
              {lastResult && stage === "complete" && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Analyzed {lastResult.frames} frames in {(lastResult.ms / 1000).toFixed(1)}s ·{" "}
                  {lastResult.count} events queued for review.
                </p>
              )}
            </div>
          )}

          {stage === "complete" && (
            <LinkButton href="/dashboard/events">Review new detections</LinkButton>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Try with demo footage</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Demo mode uses synthetic metadata only. No real CCTV, stock footage, or public dataset
          video is bundled in this app.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {syntheticDemos.map((demo) => (
            <Card key={demo.id} className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 text-slate-400">
                  <Video className="size-10" />
                </div>
                <CardTitle className="mt-3 text-base">{demo.title}</CardTitle>
                <CardDescription>{demo.locationLabel}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-xs text-muted-foreground">{demo.description}</p>
                <div className="flex flex-wrap gap-1">
                  {demo.suggestedDetections.map((d) => (
                    <Badge key={d} variant="secondary" className="text-xs font-normal">
                      {d}
                    </Badge>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant={activeDemoFootage === demo.id ? "default" : "outline"}
                  disabled={stage === "uploading" || stage === "processing"}
                  onClick={() => handleSyntheticDemoFootage(demo.id, demo.title)}
                >
                  {activeDemoFootage === demo.id && stage !== "idle" && stage !== "complete" ? (
                    <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                  ) : null}
                  Run synthetic demo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Browse the full catalog on{" "}
          <Link href="/dashboard/demo-footage" className="font-medium text-primary hover:underline">
            Demo Footage Library
          </Link>
          .
        </p>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Demo CCTV feeds — Barasat pilot</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {DEMO_FEEDS.map((feed) => (
            <Card key={feed.id} className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex aspect-video items-center justify-center rounded-lg bg-slate-900 text-slate-400">
                  <Camera className="size-10" />
                </div>
                <CardTitle className="mt-3 text-base">{feed.name}</CardTitle>
                <CardDescription>{feed.thumbnailLabel}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-xs text-muted-foreground">{feed.description}</p>
                <Badge variant="secondary" className="w-fit">{feed.status}</Badge>
                <Button
                  size="sm"
                  variant={activeFeed === feed.id ? "default" : "outline"}
                  disabled={stage === "uploading" || stage === "processing"}
                  onClick={() => handleDemoFeed(feed.id, feed.name)}
                >
                  {activeFeed === feed.id && stage !== "idle" && stage !== "complete" ? (
                    <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                  ) : null}
                  Run demo analysis
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {DEMO_DATA_NOTICE}{" "}
        <Link href="/dashboard/data-sources" className="font-medium text-primary hover:underline">
          Data sources &amp; footage policy
        </Link>
        . {/* REAL AI INTEGRATION: POST /api/videos → worker queue → PostgreSQL */}
      </p>
    </div>
  );
}
