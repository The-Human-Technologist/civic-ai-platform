"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Camera,
  CheckCircle2,
  Film,
  Info,
  Loader2,
  Upload,
  Video,
} from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DEMO_FEEDS } from "@/lib/data/locations";
import { getDemoFootageById, getSyntheticUploadDemos } from "@/lib/demo-footage";
import { processVideoMock, simulateUploadProgress } from "@/lib/mock-ai/processor";
import {
  createProcessingJob,
  getProcessingJob,
  getWorkerHealth,
  pollProcessingJob,
} from "@/lib/processing/client";
import {
  PROCESSING_JOB_STATUSES,
  type ProcessingDetection,
  type ProcessingJob,
  type ProcessingMode,
  type WorkerHealthResponse,
} from "@/lib/processing/types";
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

type ProcessingConfig = {
  aiProcessingMode: ProcessingMode;
  workerConfigured: boolean;
  workerModeEnabled?: boolean;
  mongoConfigured: boolean;
  publicLimitations: string[];
};

type SelectedFileMeta = {
  name: string;
  size: number;
  type: string;
};

function getReachedStages(job: ProcessingJob): ProcessingJob["status"][] {
  if (job.status === "failed") {
    if (job.progress >= 90) return ["queued", "extracting_frames", "masking_privacy", "running_detection", "saving_results"];
    if (job.progress >= 70) return ["queued", "extracting_frames", "masking_privacy", "running_detection"];
    if (job.progress >= 40) return ["queued", "extracting_frames", "masking_privacy"];
    if (job.progress >= 20) return ["queued", "extracting_frames"];
    return ["queued"];
  }

  const currentIndex = PROCESSING_JOB_STATUSES.indexOf(job.status);
  return PROCESSING_JOB_STATUSES.slice(0, currentIndex);
}

function UploadPageFallback() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="h-8 w-64 animate-pulse rounded bg-muted" />
      <div className="h-24 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

export function UploadPageClient({
  workerModeEnabled,
}: {
  workerModeEnabled: boolean;
}) {
  return (
    <Suspense fallback={<UploadPageFallback />}>
      <UploadPageContent workerModeEnabled={workerModeEnabled} />
    </Suspense>
  );
}

function UploadPageContent({ workerModeEnabled }: { workerModeEnabled: boolean }) {
  const searchParams = useSearchParams();
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
  const [selectedFileMeta, setSelectedFileMeta] = useState<SelectedFileMeta | null>(null);
  const [processingConfig, setProcessingConfig] = useState<ProcessingConfig | null>(null);
  const [activeJob, setActiveJob] = useState<ProcessingJob | null>(null);
  const [jobDetections, setJobDetections] = useState<ProcessingDetection[]>([]);
  const [jobNote, setJobNote] = useState<string | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);
  const [jobLoading, setJobLoading] = useState(false);
  const [workerHealth, setWorkerHealth] = useState<WorkerHealthResponse | null>(null);
  const [workerHealthLoading, setWorkerHealthLoading] = useState(false);
  const syntheticDemos = getSyntheticUploadDemos();

  const demoParam = searchParams.get("demo");

  const preselectedDemo = useMemo(() => {
    if (!demoParam) return null;
    const entry = getDemoFootageById(demoParam);
    if (!entry || entry.type !== "synthetic_placeholder") return null;
    return entry;
  }, [demoParam]);

  const invalidDemoParam = Boolean(demoParam && !preselectedDemo);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const response = await fetch("/api/processing/config", { cache: "no-store" });
        const data = (await response.json()) as ProcessingConfig;
        if (!cancelled) {
          setProcessingConfig(data);
        }
      } catch {
        if (!cancelled) {
          setProcessingConfig(null);
        }
      }
    }

    void loadConfig();
    return () => {
      cancelled = true;
    };
  }, []);

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
    setSelectedFileMeta({
      name: file.name,
      size: file.size,
      type: file.type,
    });
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

  async function syncJob(jobId: string) {
    const result = await getProcessingJob(jobId);
    setActiveJob(result.job);
    setJobDetections(result.detections ?? []);
    setJobNote(result.note ?? null);
    return result;
  }

  async function handleCreateSyntheticJob() {
    if (!preselectedDemo) return;

    setJobLoading(true);
    setJobError(null);
    setLastResult(null);
    try {
      const created = await createProcessingJob({
        sourceType: "synthetic_demo",
        demoId: preselectedDemo.id,
        videoName: preselectedDemo.title,
        locationLabel: preselectedDemo.locationLabel,
        selectedScenario: preselectedDemo.useCase,
        requestedMode:
          processingConfig?.aiProcessingMode === "worker" && processingConfig.workerModeEnabled
            ? "worker"
            : "mock",
      });
      setActiveJob(created.job);
      setJobDetections(created.detections ?? []);
      setJobNote(created.note ?? null);

      const finalResult = await pollProcessingJob(created.job.id, {
        intervalMs: 500,
        timeoutMs: 4000,
      }).catch(async () => syncJob(created.job.id));

      setActiveJob(finalResult.job);
      setJobDetections(finalResult.detections ?? []);
      setJobNote(finalResult.note ?? created.note ?? null);
      toast.success(`Processing job ${finalResult.job.id} created`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create processing job";
      setJobError(message);
      toast.error(message);
    } finally {
      setJobLoading(false);
    }
  }

  async function handleCreateMetadataOnlyJob() {
    if (!selectedFileMeta) {
      toast.error("Choose a file first to capture metadata");
      return;
    }

    setJobLoading(true);
    setJobError(null);
    setLastResult(null);
    try {
      const requestedMode: ProcessingMode =
        processingConfig?.aiProcessingMode === "worker" && processingConfig.workerModeEnabled
          ? "worker"
          : "mock";

      const created = await createProcessingJob({
        sourceType: "uploaded_video",
        videoName: selectedFileMeta.name,
        locationLabel: "Metadata-only upload foundation",
        selectedScenario: `${selectedFileMeta.type} · ${Math.round(selectedFileMeta.size / 1024)} KB`,
        requestedMode,
      });
      setActiveJob(created.job);
      setJobDetections(created.detections ?? []);
      setJobNote(created.note ?? null);

      const finalResult = await pollProcessingJob(created.job.id, {
        intervalMs: 700,
        timeoutMs: requestedMode === "mock" ? 4000 : 2500,
      }).catch(async () => syncJob(created.job.id));

      setActiveJob(finalResult.job);
      setJobDetections(finalResult.detections ?? []);
      setJobNote(finalResult.note ?? created.note ?? null);
      toast.success(`Metadata-only job ${finalResult.job.id} created`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create metadata-only job";
      setJobError(message);
      toast.error(message);
    } finally {
      setJobLoading(false);
    }
  }

  async function handleCheckWorkerHealth() {
    setWorkerHealthLoading(true);
    try {
      const health = await getWorkerHealth();
      setWorkerHealth(health);
      if (health.online) {
        toast.success("Worker health check succeeded");
      } else {
        toast.error(health.error ?? "Worker is offline");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Worker health check failed";
      setWorkerHealth({
        workerModeEnabled: false,
        workerConfigured: false,
        online: false,
        error: message,
      });
      toast.error(message);
    } finally {
      setWorkerHealthLoading(false);
    }
  }

  const showProgressPanel = stage !== "idle" || lastResult !== null;

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Video Upload &amp; Demo Feeds</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload CCTV footage or select Barasat pilot demo feeds. AI detections are simulated for
            MVP.
          </p>
        </div>
        <Link
          href="/dashboard/demo-footage"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Film className="size-4" />
          Browse Demo Footage Library
        </Link>
      </div>

      <Badge
        variant="outline"
        className="w-fit border-amber-500/60 bg-amber-500/5 text-amber-900 dark:text-amber-200"
      >
        Demo mode: uploaded files are not processed by real AI in this MVP. Detections are
        synthetic. Use only licensed or authorized footage.
      </Badge>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Phase 2 real-processing foundation</CardTitle>
          <CardDescription>
            The public demo uses mock AI by default. For a real pilot, authorized uploaded video
            will be processed by a separate FFmpeg/OpenCV worker, stored in MongoDB,
            privacy-masked, and sent to human review.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          {processingConfig ? (
            <div className="rounded-lg border bg-muted/10 p-3 text-sm">
              <p className="font-medium">Current processing mode: {processingConfig.aiProcessingMode}</p>
              <p className="mt-1 text-muted-foreground">
                Worker configured: {processingConfig.workerConfigured ? "yes" : "no"} · MongoDB
                configured: {processingConfig.mongoConfigured ? "yes" : "no"}
              </p>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
            <span>Mock processing</span>
            <Badge variant="default">Available now</Badge>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
            <span>MongoDB job schema</span>
            <Badge variant="secondary">Foundation added</Badge>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
            <span>Worker API scaffold</span>
            <Badge variant="secondary">Foundation added</Badge>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
            <span>FFmpeg frame extraction</span>
            <Badge variant="secondary">Scaffolded</Badge>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
            <span>YOLO/OpenCV inference</span>
            <Badge variant="outline">Planned</Badge>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
            <span>Face/plate masking</span>
            <Badge variant="secondary">Scaffolded, production hardening planned</Badge>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
            <span>Live CCTV/RTSP</span>
            <Badge variant="destructive">Not enabled</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Processing job foundation</CardTitle>
          <CardDescription>
            This public alpha still runs mock AI by default. Phase 2A adds a safe job API
            foundation for future authorized uploaded-video processing. Real video processing
            requires a separate worker and authorized footage.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Alert>
            <Info className="size-4" />
            <AlertTitle>Public alpha limitations</AlertTitle>
            <AlertDescription>
              Mock AI is default. Real video bytes are not uploaded yet. Worker mode is scaffolded.
              No facial recognition, no automatic challan, human review required.
            </AlertDescription>
          </Alert>

          {preselectedDemo ? (
            <div className="rounded-lg border p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Synthetic demo job</p>
                  <p className="text-sm text-muted-foreground">
                    Create a mock processing job for {preselectedDemo.title}.
                  </p>
                </div>
                <Button onClick={handleCreateSyntheticJob} disabled={jobLoading}>
                  {jobLoading ? <Loader2 className="size-4 animate-spin" data-icon="inline-start" /> : null}
                  Create mock processing job
                </Button>
              </div>
            </div>
          ) : null}

          <div className="rounded-lg border p-4">
            <div className="flex flex-col gap-2">
              <p className="font-medium">Metadata-only upload job</p>
              <p className="text-sm text-muted-foreground">
                Real upload is not enabled in public alpha. This creates a metadata-only processing
                job for workflow testing.
              </p>
              {selectedFileMeta ? (
                <div className="rounded-lg bg-muted/20 p-3 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">File:</span> {selectedFileMeta.name}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Type:</span> {selectedFileMeta.type}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Size:</span>{" "}
                    {(selectedFileMeta.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Choose any local video file first. The file bytes stay local; only metadata is
                  sent to the job API.
                </p>
              )}
              <div>
                <Button
                  variant="outline"
                  disabled={!selectedFileMeta || jobLoading}
                  onClick={handleCreateMetadataOnlyJob}
                >
                  {jobLoading ? <Loader2 className="size-4 animate-spin" data-icon="inline-start" /> : null}
                  Create metadata-only job
                </Button>
              </div>
            </div>
          </div>

          {(activeJob || jobError || jobNote) && (
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">Processing job status</p>
                {activeJob ? <Badge variant="outline">{activeJob.status}</Badge> : null}
              </div>
              {jobError ? <p className="mt-2 text-sm text-destructive">{jobError}</p> : null}
              {jobNote ? <p className="mt-2 text-sm text-muted-foreground">{jobNote}</p> : null}
              {activeJob ? (
                <>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-muted/20 p-3 text-sm">
                      <p><span className="font-medium">Job ID:</span> {activeJob.id}</p>
                      <p><span className="font-medium">Mode:</span> {activeJob.mode}</p>
                      <p><span className="font-medium">Source type:</span> {activeJob.sourceType}</p>
                      <p><span className="font-medium">Status:</span> {activeJob.status}</p>
                      <p><span className="font-medium">Progress:</span> {activeJob.progress}%</p>
                    </div>
                    <div className="rounded-lg bg-muted/20 p-3 text-sm">
                      <p><span className="font-medium">Created at:</span> {new Date(activeJob.createdAt).toLocaleString()}</p>
                      <p><span className="font-medium">Updated at:</span> {new Date(activeJob.updatedAt).toLocaleString()}</p>
                      {activeJob.locationLabel ? (
                        <p><span className="font-medium">Location label:</span> {activeJob.locationLabel}</p>
                      ) : null}
                      {activeJob.selectedScenario ? (
                        <p><span className="font-medium">Scenario:</span> {activeJob.selectedScenario}</p>
                      ) : null}
                      {activeJob.error ? (
                        <p className="text-destructive"><span className="font-medium">Error:</span> {activeJob.error}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4">
                    <Progress value={activeJob.progress} className="h-2" />
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                      {PROCESSING_JOB_STATUSES.map((statusName) => {
                        const isActive = activeJob.status === statusName;
                        const isDone = getReachedStages(activeJob).includes(statusName);
                        return (
                          <div
                            key={statusName}
                            className="rounded-lg border px-3 py-2 text-sm"
                          >
                            <p className="font-medium capitalize">
                              {statusName.replaceAll("_", " ")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {isActive ? "Current" : isDone ? "Reached" : "Pending"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {jobDetections.length > 0 && (
            <div className="rounded-lg border p-4">
              <p className="font-medium">Mock detections from job API</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {jobDetections.map((detection) => (
                  <div key={detection.id} className="rounded-lg border bg-muted/10 p-3 text-sm">
                    <p><span className="font-medium">Type:</span> {detection.type}</p>
                    <p><span className="font-medium">Confidence:</span> {(detection.confidence * 100).toFixed(0)}%</p>
                    <p><span className="font-medium">Severity:</span> {detection.severity}</p>
                    <p><span className="font-medium">Location:</span> {detection.locationLabel}</p>
                    {typeof detection.frameTimestampSec === "number" ? (
                      <p><span className="font-medium">Frame time:</span> {detection.frameTimestampSec}s</p>
                    ) : null}
                    <p><span className="font-medium">Privacy masked:</span> {detection.privacyMasked ? "Yes" : "No"}</p>
                    <p><span className="font-medium">Human review:</span> {detection.humanReviewStatus}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Worker mode status</CardTitle>
          <CardDescription>
            Worker routing is feature-flagged. Mock mode remains the safe default, and real video
            upload stays disabled in the public alpha.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/10 p-3 text-sm">
              <p>
                <span className="font-medium">Current mode:</span>{" "}
                {processingConfig?.aiProcessingMode ?? "mock"}
              </p>
              <p>
                <span className="font-medium">Worker URL configured:</span>{" "}
                {processingConfig?.workerConfigured ? "yes" : "no"}
              </p>
              <p>
                <span className="font-medium">Real video upload:</span> disabled in public alpha
              </p>
              <p>
                <span className="font-medium">Real inference:</span> not enabled yet
              </p>
            </div>
            <div className="rounded-lg border bg-muted/10 p-3 text-sm">
              <p>
                <span className="font-medium">Worker health:</span>{" "}
                {workerHealthLoading
                  ? "checking"
                  : workerHealth
                    ? workerHealth.online
                      ? "online"
                      : "offline"
                    : "not checked"}
              </p>
              {workerHealth?.error ? (
                <p className="mt-1 text-destructive">{workerHealth.error}</p>
              ) : null}
              {workerHealth?.health ? (
                <p className="mt-1 text-muted-foreground">
                  {workerHealth.health.service} · mode {workerHealth.health.mode} · real inference{" "}
                  {workerHealth.health.realInferenceEnabled ? "enabled" : "disabled"}
                </p>
              ) : null}
            </div>
          </div>

          {processingConfig?.aiProcessingMode === "mock" ? (
            <Alert>
              <Info className="size-4" />
              <AlertDescription>Public demo is running safely in mock mode.</AlertDescription>
            </Alert>
          ) : workerHealth?.online ? (
            <Alert>
              <Info className="size-4" />
              <AlertDescription>
                Worker connector is active for demo jobs. Real video bytes are still disabled.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Info className="size-4" />
              <AlertDescription>
                Worker mode is enabled but the worker may be offline. The public mock workflow
                should remain usable.
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Button
              variant="outline"
              onClick={handleCheckWorkerHealth}
              disabled={workerHealthLoading}
            >
              {workerHealthLoading ? (
                <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              ) : null}
              Check worker health
            </Button>
          </div>
        </CardContent>
      </Card>

      {workerModeEnabled && (
        <Alert>
          <Info className="size-4" />
          <AlertTitle>Experimental worker mode configured</AlertTitle>
          <AlertDescription>
            Worker mode is scaffolded only. The public UI still uses mock processing by default,
            and real uploaded-video execution should happen in a separate backend worker.
          </AlertDescription>
        </Alert>
      )}

      {invalidDemoParam && (
        <Alert variant="destructive">
          <Info className="size-4" />
          <AlertTitle>Unknown demo scenario</AlertTitle>
          <AlertDescription>
            The demo id <code className="rounded bg-muted px-1">{demoParam}</code> is not a valid
            synthetic placeholder.{" "}
            <Link
              href="/dashboard/demo-footage"
              className="font-medium underline underline-offset-2"
            >
              Browse Demo Footage Library
            </Link>{" "}
            for available mock scenarios.
          </AlertDescription>
        </Alert>
      )}

      {preselectedDemo && (
        <Card className="border-primary/30 bg-primary/5 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Selected demo: {preselectedDemo.title}</CardTitle>
            <CardDescription>{preselectedDemo.locationLabel}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Use case
              </p>
              <p className="mt-1 text-sm leading-relaxed">{preselectedDemo.useCase}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Suggested detections
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {preselectedDemo.suggestedDetections.map((d) => (
                  <Badge key={d} variant="secondary" className="font-normal">
                    {d}
                  </Badge>
                ))}
              </div>
            </div>
            <Alert className="border-amber-500/40 bg-amber-500/5">
              <Info className="size-4 text-amber-700 dark:text-amber-400" />
              <AlertDescription className="text-sm text-amber-950 dark:text-amber-100">
                This is a synthetic mock scenario. No real video is processed.
              </AlertDescription>
            </Alert>
            <Button
              disabled={stage === "uploading" || stage === "processing"}
              onClick={() => handleSyntheticDemoFootage(preselectedDemo.id, preselectedDemo.title)}
            >
              {stage === "uploading" || stage === "processing" ? (
                <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              ) : (
                <Video className="size-4" data-icon="inline-start" />
              )}
              Run Mock Processing
            </Button>
          </CardContent>
        </Card>
      )}

      {showProgressPanel && (
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-medium">{fileName ?? "Processing…"}</span>
            <span className="text-muted-foreground">{STAGE_LABELS[stage]}</span>
          </div>
          <Progress value={STAGE_PROGRESS[stage]} className="h-2" />
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge
              variant={
                stage === "uploading" || stage === "processing" || stage === "complete"
                  ? "default"
                  : "outline"
              }
            >
              {stage === "uploading" || stage === "processing" ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <CheckCircle2 className="size-3" />
              )}
              Uploading
            </Badge>
            <Badge
              variant={stage === "processing" || stage === "complete" ? "default" : "outline"}
            >
              {stage === "processing" ? <Loader2 className="size-3 animate-spin" /> : null}
              Processing
            </Badge>
            <Badge variant={stage === "complete" ? "default" : "outline"}>
              Detections generated
            </Badge>
          </div>
          {lastResult && stage === "complete" && (
            <p className="mt-3 text-sm text-muted-foreground">
              Analyzed {lastResult.frames} frames in {(lastResult.ms / 1000).toFixed(1)}s ·{" "}
              {lastResult.count} events queued for review.
            </p>
          )}
          {stage === "complete" && (
            <LinkButton href="/dashboard/events" className="mt-4">
              Review new detections
            </LinkButton>
          )}
        </div>
      )}

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
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Try with demo footage</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Demo mode uses synthetic metadata only. No real CCTV, stock footage, or public dataset
          video is bundled in this app.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                <p className="text-xs leading-relaxed text-muted-foreground">{demo.description}</p>
                <div className="flex flex-wrap gap-1">
                  {demo.suggestedDetections.map((d) => (
                    <Badge key={d} variant="secondary" className="text-xs font-normal">
                      {d}
                    </Badge>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant={
                    activeDemoFootage === demo.id || preselectedDemo?.id === demo.id
                      ? "default"
                      : "outline"
                  }
                  disabled={stage === "uploading" || stage === "processing"}
                  onClick={() => handleSyntheticDemoFootage(demo.id, demo.title)}
                >
                  {activeDemoFootage === demo.id &&
                  stage !== "idle" &&
                  stage !== "complete" ? (
                    <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                  ) : null}
                  Run synthetic demo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Full catalog:{" "}
          <Link href="/dashboard/demo-footage" className="font-medium text-primary hover:underline">
            Demo Footage Library
          </Link>
        </p>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Demo CCTV feeds — Barasat pilot</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                <p className="text-xs leading-relaxed text-muted-foreground">{feed.description}</p>
                <Badge variant="secondary" className="w-fit">
                  {feed.status}
                </Badge>
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
        . Real pilot processing remains feature-flagged and worker-based; the public alpha stays in
        mock mode by default.
      </p>
    </div>
  );
}
