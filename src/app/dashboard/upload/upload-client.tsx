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
  processAuthorizedVideo,
} from "@/lib/processing/client";
import { processingDetectionsToReviewEvents } from "@/lib/processing/to-review-events";
import {
  PROCESSING_JOB_STATUSES,
  type ProcessingDetection,
  type ProcessingJob,
  type ProcessingMode,
  type AnalysisModule,
  type ExpectedDirection,
  type WorkerHealthResponse,
} from "@/lib/processing/types";
import type {
  AuthorizedFootageIntake,
  AuthorizedFootageSourceType,
  PresignedUploadResponse,
} from "@/lib/storage/types";
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

const MODULE_OPTIONS: {
  id: AnalysisModule;
  title: string;
  description: string;
}[] = [
  { id: "traffic", title: "Traffic density", description: "People, vehicles, and congestion" },
  { id: "civic", title: "Road & waste", description: "Potholes, road damage, and garbage" },
  { id: "helmet", title: "Helmet compliance", description: "Helmet / non-helmet specialist model" },
  {
    id: "waterlogging",
    title: "Waterlogging",
    description: "Experimental open-vocabulary standing-water advisory",
  },
  {
    id: "wrong_way",
    title: "Wrong-way movement",
    description: "Tracked vehicles compared with the permitted direction",
  },
];

type ProcessingConfig = {
  aiProcessingMode: ProcessingMode;
  workerConfigured: boolean;
  workerModeEnabled?: boolean;
  mongoConfigured: boolean;
  authorizedUploadsEnabled?: boolean;
  storageProvider?: string;
  maxAuthorizedVideoUploadMb?: number;
  publicLimitations: string[];
};

type SelectedFileMeta = {
  name: string;
  size: number;
  type: string;
};

type IntakeDraft = {
  title: string;
  locationLabel: string;
  sourceType: AuthorizedFootageSourceType;
  jurisdiction: string;
  authorizationContact: string;
  authorizationReference: string;
  notes: string;
  retentionDays: number;
  writtenAuthorizationAvailable: boolean;
  faceBlurRequired: boolean;
  plateMaskingRequired: boolean;
  humanReviewRequired: boolean;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingConfig, setProcessingConfig] = useState<ProcessingConfig | null>(null);
  const [activeJob, setActiveJob] = useState<ProcessingJob | null>(null);
  const [jobDetections, setJobDetections] = useState<ProcessingDetection[]>([]);
  const [jobNote, setJobNote] = useState<string | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);
  const [jobLoading, setJobLoading] = useState(false);
  const [realRunMeta, setRealRunMeta] = useState<{
    modelName?: string;
    device?: string;
    objectsDetected?: number;
    classCounts?: Record<string, number>;
    modelsUsed?: string[];
    requestedModules?: AnalysisModule[];
  } | null>(null);
  const [analysisModules, setAnalysisModules] = useState<AnalysisModule[]>([
    "traffic",
    "civic",
    "helmet",
    "waterlogging",
  ]);
  const [expectedDirection, setExpectedDirection] =
    useState<ExpectedDirection>("left_to_right");
  const [workerHealth, setWorkerHealth] = useState<WorkerHealthResponse | null>(null);
  const [workerHealthLoading, setWorkerHealthLoading] = useState(false);
  const [intakeDraft, setIntakeDraft] = useState<IntakeDraft>({
    title: "",
    locationLabel: "",
    sourceType: "municipal_uploaded_clip",
    jurisdiction: "",
    authorizationContact: "",
    authorizationReference: "",
    notes: "",
    retentionDays: 30,
    writtenAuthorizationAvailable: false,
    faceBlurRequired: true,
    plateMaskingRequired: true,
    humanReviewRequired: true,
  });
  const [authorizedIntake, setAuthorizedIntake] = useState<AuthorizedFootageIntake | null>(null);
  const [authorizedUploadFile, setAuthorizedUploadFile] = useState<SelectedFileMeta | null>(null);
  const [presignResponse, setPresignResponse] = useState<PresignedUploadResponse | null>(null);
  const [intakeLoading, setIntakeLoading] = useState(false);
  const [presignLoading, setPresignLoading] = useState(false);
  const syncedReviewJobs = useRef(new Set<string>());
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

  useEffect(() => {
    let cancelled = false;
    async function loadWorkerHealth() {
      try {
        const result = await getWorkerHealth();
        if (!cancelled) setWorkerHealth(result);
      } catch {
        if (!cancelled) setWorkerHealth(null);
      }
    }
    void loadWorkerHealth();
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

  function handleFileChange(file: File | null) {
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
    setSelectedFile(file);
    setFileName(file.name);
    setActiveFeed(null);
    setActiveDemoFootage(null);
    setLastResult(null);
    setStage("idle");
    toast.success("Authorized clip selected. Confirm the location and authorization before analysis.");
  }

  async function handleRealVideoProcessing() {
    if (!selectedFile) {
      toast.error("Choose an authorized video clip first");
      return;
    }
    if (!intakeDraft.locationLabel.trim()) {
      toast.error("Enter the footage location");
      return;
    }
    if (!intakeDraft.writtenAuthorizationAvailable || !intakeDraft.authorizationReference.trim()) {
      toast.error("Confirm authorization and enter its reference");
      return;
    }
    setJobLoading(true);
    setJobError(null);
    setJobNote(null);
    setRealRunMeta(null);
    setStage("uploading");
    try {
      const result = await processAuthorizedVideo({
        file: selectedFile,
        locationLabel: intakeDraft.locationLabel.trim(),
        authorizationReference: intakeDraft.authorizationReference.trim(),
        authorizationConfirmed: intakeDraft.writtenAuthorizationAvailable,
        analysisModules,
        expectedDirection: analysisModules.includes("wrong_way")
          ? expectedDirection
          : undefined,
      });
      setStage("processing");
      setActiveJob(result.job);
      const detections = result.detections ?? [];
      setJobDetections(detections);
      setJobNote(result.note ?? null);
      setRealRunMeta({
        modelName: result.modelName,
        device: result.device,
        objectsDetected: result.objectsDetected,
        classCounts: result.classCounts,
        modelsUsed: result.modelsUsed,
        requestedModules: result.requestedModules,
      });
      setLastResult({
        count: detections.length,
        frames: result.framesAnalyzed ?? 0,
        ms: result.processingMs ?? 0,
      });
      syncDetectionsToHumanReview(result.job, detections);
      setStage("complete");
      toast.success(
        detections.length
          ? `${detections.length} real AI alerts added for human review`
          : "Real AI analysis completed; no civic alert threshold was met",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Real video processing failed";
      setJobError(message);
      setStage("error");
      toast.error(message);
    } finally {
      setJobLoading(false);
    }
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

  function syncDetectionsToHumanReview(
    job: ProcessingJob,
    detections: ProcessingDetection[],
  ) {
    if (job.status !== "completed" || syncedReviewJobs.current.has(job.id)) return;

    const reviewEvents = processingDetectionsToReviewEvents(job, detections);
    if (reviewEvents.length === 0) return;

    addEvents(reviewEvents);
    syncedReviewJobs.current.add(job.id);
    toast.success(`${reviewEvents.length} job detections added to human review`);
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
      syncDetectionsToHumanReview(finalResult.job, finalResult.detections ?? []);
      toast.success(`Processing job ${finalResult.job.id} created`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create processing job";
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

  function updateIntakeDraft<K extends keyof IntakeDraft>(key: K, value: IntakeDraft[K]) {
    setIntakeDraft((current) => ({ ...current, [key]: value }));
  }

  async function handleCreateAuthorizedIntake() {
    setIntakeLoading(true);
    setPresignResponse(null);
    try {
      const response = await fetch("/api/authorized-footage/intakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: intakeDraft.title,
          sourceType: intakeDraft.sourceType,
          locationLabel: intakeDraft.locationLabel,
          jurisdiction: intakeDraft.jurisdiction,
          authorizationContact:
            intakeDraft.authorizationContact ||
            (intakeDraft.writtenAuthorizationAvailable ? "Written authorization on file" : ""),
          authorizationReference: intakeDraft.authorizationReference || undefined,
          notes: intakeDraft.notes || undefined,
          retentionDays: intakeDraft.retentionDays,
          privacyMaskingRequired: true,
          plateMaskingRequired: intakeDraft.plateMaskingRequired,
          faceBlurRequired: intakeDraft.faceBlurRequired,
          humanReviewRequired: intakeDraft.humanReviewRequired,
          status: intakeDraft.writtenAuthorizationAvailable
            ? "authorized"
            : "awaiting_authorization",
        }),
      });
      const payload = (await response.json()) as
        | { intake: AuthorizedFootageIntake; note?: string }
        | { error: string };

      if (!response.ok || !("intake" in payload)) {
        throw new Error("error" in payload ? payload.error : "Failed to create authorized intake");
      }

      setAuthorizedIntake(payload.intake);
      setPresignResponse(null);
      toast.success(`Authorized intake ${payload.intake.id} created`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create authorized intake");
    } finally {
      setIntakeLoading(false);
    }
  }

  async function handleRequestUploadUrl() {
    if (!authorizedIntake) {
      toast.error("Create an authorized footage intake first");
      return;
    }
    if (!authorizedUploadFile) {
      toast.error("Choose a local file to send metadata only");
      return;
    }

    setPresignLoading(true);
    try {
      const response = await fetch("/api/authorized-footage/presign-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intakeId: authorizedIntake.id,
          fileName: authorizedUploadFile.name,
          contentType: authorizedUploadFile.type,
          fileSizeBytes: authorizedUploadFile.size,
        }),
      });
      const payload = (await response.json()) as PresignedUploadResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to request controlled upload URL");
      }

      setPresignResponse(payload);
      if (payload.enabled) {
        toast.success("Controlled upload URL issued");
      } else {
        toast.error(payload.message);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to request controlled upload URL";
      toast.error(message);
      setPresignResponse({
        enabled: false,
        limitations: [],
        message,
      });
    } finally {
      setPresignLoading(false);
    }
  }

  const showProgressPanel = stage !== "idle" || lastResult !== null;

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Authorized Video Intelligence</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Run privacy-first YOLO analysis on authorized footage and send advisory alerts to human review.
          </p>
        </div>
        <Link
          href="/dashboard/demo-footage"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Film className="size-4" />
          Browse Sample Footage Library
        </Link>
      </div>

      <Badge
        variant="outline"
        className="h-auto max-w-full whitespace-normal border-amber-500/60 bg-amber-500/5 py-1.5 text-left leading-relaxed text-amber-900 dark:text-amber-200"
      >
        Prototype rule: real AI accepts authorized uploaded clips only. No facial recognition,
        live surveillance, or automatic enforcement.
      </Badge>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Real-processing prototype</CardTitle>
          <CardDescription>
            Traffic, civic, helmet, waterlogging, and tracking models run locally through the
            separate AI worker. People and vehicles are conservatively masked in evidence images;
            every alert requires human confirmation.
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
            <span>Real authorized-video inference</span>
            <Badge variant="default">Implemented</Badge>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
            <span>MongoDB job schema</span>
            <Badge variant="secondary">Foundation added</Badge>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
            <span>Worker API</span>
            <Badge variant="secondary">Operational</Badge>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
            <span>FFmpeg/OpenCV frame extraction</span>
            <Badge variant="secondary">Guarded local utility</Badge>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
            <span>YOLO26n / OpenCV inference</span>
            <Badge variant="default">Implemented</Badge>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
            <span>Privacy-safe evidence</span>
            <Badge variant="secondary">Whole person/vehicle masking</Badge>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
            <span>Live CCTV/RTSP</span>
            <Badge variant="destructive">Not enabled</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Processing and review pipeline</CardTitle>
          <CardDescription>
            Real video analysis runs in the local worker. Synthetic samples remain available only
            for explaining the review workflow without using footage.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Alert>
            <Info className="size-4" />
            <AlertTitle>Prototype safeguards</AlertTitle>
            <AlertDescription>
              Authorized uploaded clips only. No facial recognition, live CCTV, or automatic
              challan. Every output is an advisory pending human review.
            </AlertDescription>
          </Alert>

          {preselectedDemo ? (
            <div className="rounded-lg border p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Synthetic sample job</p>
                  <p className="text-sm text-muted-foreground">
                    Exercise the review workflow for {preselectedDemo.title}.
                  </p>
                </div>
                <Button onClick={handleCreateSyntheticJob} disabled={jobLoading}>
                  {jobLoading ? <Loader2 className="size-4 animate-spin" data-icon="inline-start" /> : null}
                  Create sample processing job
                </Button>
              </div>
            </div>
          ) : null}

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
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-medium">Detections from job API</p>
                <Badge variant="secondary">Added to human review when completed</Badge>
              </div>
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
          The local worker performs real sequential AI inference. The hosted frontend requires a
          reachable worker URL for real processing.
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
                <span className="font-medium">Authorized video:</span>{" "}
                {processingConfig?.workerModeEnabled ? "enabled" : "worker configuration required"}
              </p>
              <p>
                <span className="font-medium">Real inference:</span>{" "}
                {workerHealth?.health?.realInferenceEnabled ? "ready" : "check worker"}
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
                <div className="mt-1 text-muted-foreground">
                  <p>
                    {workerHealth.health.service} · {workerHealth.health.modelName ?? "YOLO"} ·{" "}
                    {workerHealth.health.device ?? "device unknown"}
                  </p>
                  <p>
                    Real inference {workerHealth.health.realInferenceEnabled ? "ready" : "not ready"}
                    {" "}· privacy masking{" "}
                    {workerHealth.health.privacyMaskingEnabled === false ? "off" : "on"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {Object.entries(workerHealth.health.moduleStatus ?? {}).map(
                      ([name, status]) => (
                        <Badge
                          key={name}
                          variant={status.available ? "secondary" : "outline"}
                          className={status.available ? "text-emerald-700 dark:text-emerald-300" : ""}
                        >
                          {name.replace("_", " ")}: {status.available ? "ready" : "missing"}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {processingConfig?.aiProcessingMode === "mock" ? (
            <Alert>
              <Info className="size-4" />
              <AlertDescription>
                Sample mode is active. Set AI_PROCESSING_MODE=worker and AI_WORKER_URL to enable
                authorized-video inference.
              </AlertDescription>
            </Alert>
          ) : workerHealth?.online ? (
            <Alert>
              <Info className="size-4" />
              <AlertDescription>
                Worker is online. Real authorized-video processing is available.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Info className="size-4" />
              <AlertDescription>
                Worker mode is enabled but the worker is offline. Start the FastAPI worker before
                the police walkthrough.
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

      <Card className="hidden">
        <CardHeader>
          <CardTitle className="text-base">Authorized footage intake</CardTitle>
          <CardDescription>
            Use this record for controlled municipal storage workflows. Direct prototype analysis
            above deletes the uploaded clip immediately after inference.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Alert>
            <Info className="size-4" />
            <AlertDescription>
              No public video upload is enabled. Authorized pilot footage only. No live CCTV/RTSP.
              No facial recognition. Privacy masking must happen before evidence persistence.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Title</span>
              <input
                className="rounded-md border bg-background px-3 py-2"
                value={intakeDraft.title}
                onChange={(e) => updateIntakeDraft("title", e.target.value)}
                placeholder="Barasat pilot clip batch"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Location / road / junction</span>
              <input
                className="rounded-md border bg-background px-3 py-2"
                value={intakeDraft.locationLabel}
                onChange={(e) => updateIntakeDraft("locationLabel", e.target.value)}
                placeholder="Station Road and Colony More"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Source type</span>
              <select
                className="rounded-md border bg-background px-3 py-2"
                value={intakeDraft.sourceType}
                onChange={(e) =>
                  updateIntakeDraft("sourceType", e.target.value as AuthorizedFootageSourceType)
                }
              >
                <option value="municipal_uploaded_clip">Municipal uploaded clip</option>
                <option value="traffic_department_clip">Traffic department clip</option>
                <option value="ward_office_clip">Ward office clip</option>
                <option value="synthetic_demo">Synthetic sample</option>
                <option value="external_dataset_reference">External dataset reference</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Jurisdiction / department</span>
              <input
                className="rounded-md border bg-background px-3 py-2"
                value={intakeDraft.jurisdiction}
                onChange={(e) => updateIntakeDraft("jurisdiction", e.target.value)}
                placeholder="Barasat Municipality"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Authorization contact</span>
              <input
                className="rounded-md border bg-background px-3 py-2"
                value={intakeDraft.authorizationContact}
                onChange={(e) => updateIntakeDraft("authorizationContact", e.target.value)}
                placeholder="Nodal officer or department contact"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Written authorization reference</span>
              <input
                className="rounded-md border bg-background px-3 py-2"
                value={intakeDraft.authorizationReference}
                onChange={(e) => updateIntakeDraft("authorizationReference", e.target.value)}
                placeholder="Letter number / approval ID"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Retention days</span>
              <input
                type="number"
                min={1}
                className="rounded-md border bg-background px-3 py-2"
                value={intakeDraft.retentionDays}
                onChange={(e) =>
                  updateIntakeDraft("retentionDays", Math.max(1, Number(e.target.value) || 30))
                }
              />
            </label>
          </div>

          <label className="grid gap-1 text-sm">
            <span className="font-medium">Notes</span>
            <textarea
              className="min-h-24 rounded-md border bg-background px-3 py-2"
              value={intakeDraft.notes}
              onChange={(e) => updateIntakeDraft("notes", e.target.value)}
              placeholder="Permission scope, corridor, privacy constraints, or pilot notes"
            />
          </label>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={intakeDraft.writtenAuthorizationAvailable}
                onChange={(e) =>
                  updateIntakeDraft("writtenAuthorizationAvailable", e.target.checked)
                }
              />
              Written authorization available
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={intakeDraft.faceBlurRequired}
                onChange={(e) => updateIntakeDraft("faceBlurRequired", e.target.checked)}
              />
              Face blur required
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={intakeDraft.plateMaskingRequired}
                onChange={(e) => updateIntakeDraft("plateMaskingRequired", e.target.checked)}
              />
              Plate masking required
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={intakeDraft.humanReviewRequired}
                onChange={(e) => updateIntakeDraft("humanReviewRequired", e.target.checked)}
              />
              Human review required
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleCreateAuthorizedIntake}
              disabled={
                intakeLoading ||
                !intakeDraft.title.trim() ||
                !intakeDraft.locationLabel.trim() ||
                !intakeDraft.jurisdiction.trim() ||
                (intakeDraft.writtenAuthorizationAvailable &&
                  !intakeDraft.authorizationReference.trim())
              }
            >
              {intakeLoading ? <Loader2 className="size-4 animate-spin" data-icon="inline-start" /> : null}
              Create authorized footage intake
            </Button>
            <Badge variant="outline">
              Public uploads enabled: {processingConfig?.authorizedUploadsEnabled ? "yes" : "no"}
            </Badge>
            <Badge variant="outline">
              Storage provider: {processingConfig?.storageProvider ?? "disabled"}
            </Badge>
          </div>

          {authorizedIntake ? (
            <div className="rounded-lg border bg-muted/10 p-4 text-sm">
              <p><span className="font-medium">Intake ID:</span> {authorizedIntake.id}</p>
              <p><span className="font-medium">Status:</span> {authorizedIntake.status}</p>
              <p><span className="font-medium">Retention:</span> {authorizedIntake.retentionDays} days</p>
              <p><span className="font-medium">Privacy masking:</span> {authorizedIntake.privacyMaskingRequired ? "required" : "not set"}</p>
            </div>
          ) : null}

          <div className="rounded-lg border p-4">
            <p className="font-medium">Controlled upload URL request</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a file to capture metadata only, then request a controlled upload URL. This
              does not upload bytes by default.
            </p>
            <input
              type="file"
              accept="video/*"
              className="mt-3 block w-full text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setAuthorizedUploadFile(
                  file
                    ? { name: file.name, size: file.size, type: file.type }
                    : null,
                );
              }}
            />
            {authorizedUploadFile ? (
              <div className="mt-3 rounded-lg bg-muted/20 p-3 text-sm text-muted-foreground">
                <p><span className="font-medium text-foreground">File:</span> {authorizedUploadFile.name}</p>
                <p><span className="font-medium text-foreground">Type:</span> {authorizedUploadFile.type}</p>
                <p><span className="font-medium text-foreground">Size:</span> {(authorizedUploadFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            ) : null}
            <div className="mt-3">
              <Button
                variant="outline"
                onClick={handleRequestUploadUrl}
                disabled={!authorizedIntake || !authorizedUploadFile || presignLoading}
              >
                {presignLoading ? <Loader2 className="size-4 animate-spin" data-icon="inline-start" /> : null}
                Request controlled upload URL
              </Button>
            </div>
            {presignResponse ? (
              <div className="mt-3 rounded-lg border bg-muted/10 p-3 text-sm">
                <p className="font-medium">{presignResponse.message}</p>
                {presignResponse.objectKey ? (
                  <p className="mt-1 text-muted-foreground">
                    Proposed object key: {presignResponse.objectKey}
                  </p>
                ) : null}
                {presignResponse.uploadUrl ? (
                  <p className="mt-1 break-all text-muted-foreground">
                    Upload URL: {presignResponse.uploadUrl}
                  </p>
                ) : null}
                {presignResponse.limitations.length > 0 ? (
                  <ul className="mt-2 list-disc pl-5 text-muted-foreground">
                    {presignResponse.limitations.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {workerModeEnabled && (
        <Alert>
          <Info className="size-4" />
          <AlertTitle>Real AI worker configured</AlertTitle>
          <AlertDescription>
            Authorized uploaded-video execution runs in the separate backend worker. Keep that
            worker local or behind authenticated network controls.
          </AlertDescription>
        </Alert>
      )}

      {invalidDemoParam && (
        <Alert variant="destructive">
          <Info className="size-4" />
          <AlertTitle>Unknown sample scenario</AlertTitle>
          <AlertDescription>
            The sample id <code className="rounded bg-muted px-1">{demoParam}</code> is not a valid
            synthetic placeholder.{" "}
            <Link
              href="/dashboard/demo-footage"
              className="font-medium underline underline-offset-2"
            >
              Browse Sample Footage Library
            </Link>{" "}
            for available synthetic scenarios.
          </AlertDescription>
        </Alert>
      )}

      {preselectedDemo && (
        <Card className="border-primary/30 bg-primary/5 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Selected sample: {preselectedDemo.title}</CardTitle>
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
                This is a synthetic sample scenario. No video is processed.
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
        <AlertTitle>Existing footage analytics — active prototype workflow</AlertTitle>
        <AlertDescription>
          Video is sent only to the configured local worker, analyzed, and deleted immediately.
          Only privacy-masked evidence images and detection metadata return to the review queue.
          Authorized uploaded clips only; no live RTSP. {DISCLAIMER}
        </AlertDescription>
      </Alert>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Run real multi-model AI analysis</CardTitle>
          <CardDescription>
            MP4, WebM, MOV, or AVI · maximum {processingConfig?.maxAuthorizedVideoUploadMb ?? 250} MB
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          <div
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-muted/30 p-6 text-center sm:p-10"
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
            {selectedFileMeta ? (
              <p className="max-w-full break-all text-xs text-muted-foreground">
                {selectedFileMeta.name} · {(selectedFileMeta.size / 1024 / 1024).toFixed(2)} MB
              </p>
            ) : null}
          </div>
          <div className="grid gap-4 rounded-xl border bg-muted/10 p-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Footage location</span>
              <input
                className="h-10 rounded-md border bg-background px-3"
                placeholder="e.g. Barasat Station Road"
                value={intakeDraft.locationLabel}
                onChange={(event) =>
                  setIntakeDraft((current) => ({ ...current, locationLabel: event.target.value }))
                }
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Authorization / licence reference</span>
              <input
                className="h-10 rounded-md border bg-background px-3"
                placeholder="Letter, case, owner, or stock licence reference"
                value={intakeDraft.authorizationReference}
                onChange={(event) =>
                  setIntakeDraft((current) => ({
                    ...current,
                    authorizationReference: event.target.value,
                  }))
                }
              />
            </label>
            <label className="flex items-start gap-3 text-sm sm:col-span-2">
              <input
                className="mt-1 size-4"
                type="checkbox"
                checked={intakeDraft.writtenAuthorizationAvailable}
                onChange={(event) =>
                  setIntakeDraft((current) => ({
                    ...current,
                    writtenAuthorizationAvailable: event.target.checked,
                  }))
                }
              />
              <span>
                I confirm this footage is authorized or properly licensed for analysis, and I accept
                mandatory human review with no automatic enforcement.
              </span>
            </label>
          </div>
          <div className="grid gap-3 rounded-xl border bg-muted/10 p-4">
            <div>
              <p className="text-sm font-medium">AI analysis modules</p>
              <p className="text-xs text-muted-foreground">
                Models run sequentially to stay within the RTX 3050&apos;s 4 GB VRAM.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {MODULE_OPTIONS.map((module) => {
                const ready = workerHealth?.health?.moduleStatus?.[module.id]?.available ?? false;
                const checked = analysisModules.includes(module.id);
                return (
                  <label
                    key={module.id}
                    className="flex min-w-0 items-start gap-3 rounded-lg border bg-background p-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 size-4"
                      checked={checked}
                      disabled={workerHealth?.online === true && !ready}
                      onChange={(event) =>
                        setAnalysisModules((current) =>
                          event.target.checked
                            ? [...current, module.id]
                            : current.filter((value) => value !== module.id),
                        )
                      }
                    />
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-1.5 font-medium">
                        {module.title}
                        <Badge variant={ready ? "secondary" : "outline"} className="text-[10px]">
                          {ready ? "ready" : "check"}
                        </Badge>
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {module.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            {analysisModules.includes("wrong_way") ? (
              <label className="grid max-w-md gap-1.5 text-sm">
                <span className="font-medium">Permitted direction in this camera view</span>
                <select
                  className="h-10 rounded-md border bg-background px-3"
                  value={expectedDirection}
                  onChange={(event) =>
                    setExpectedDirection(event.target.value as ExpectedDirection)
                  }
                >
                  <option value="left_to_right">Left to right</option>
                  <option value="right_to_left">Right to left</option>
                  <option value="top_to_bottom">Top to bottom</option>
                  <option value="bottom_to_top">Bottom to top</option>
                </select>
                <span className="text-xs text-muted-foreground">
                  This is a per-camera calibration input, not an automatic legal conclusion.
                </span>
              </label>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              disabled={
                jobLoading ||
                !selectedFile ||
                !intakeDraft.locationLabel.trim() ||
                !intakeDraft.authorizationReference.trim() ||
                !intakeDraft.writtenAuthorizationAvailable ||
                analysisModules.length === 0 ||
                !workerHealth?.online ||
                !workerHealth.health?.realInferenceEnabled
              }
              onClick={handleRealVideoProcessing}
            >
              {jobLoading ? <Loader2 className="size-4 animate-spin" data-icon="inline-start" /> : null}
              Run multi-model analysis
            </Button>
            {!workerHealth?.online ? (
              <p className="text-xs text-muted-foreground">
                Check worker health first. Real analysis requires the local AI worker.
              </p>
            ) : null}
          </div>
          {realRunMeta ? (
            <div className="grid gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4 text-sm sm:grid-cols-2">
              <p><span className="font-medium">Model:</span> {realRunMeta.modelName ?? "YOLO"}</p>
              <p><span className="font-medium">Device:</span> {realRunMeta.device ?? "unknown"}</p>
              <p><span className="font-medium">Objects:</span> {realRunMeta.objectsDetected ?? 0}</p>
              <p className="break-words">
                <span className="font-medium">Models:</span>{" "}
                {realRunMeta.modelsUsed?.join(", ") || realRunMeta.modelName || "none"}
              </p>
              <p className="break-words">
                <span className="font-medium">Classes:</span>{" "}
                {Object.entries(realRunMeta.classCounts ?? {})
                  .map(([name, count]) => `${name} ${count}`)
                  .join(", ") || "none"}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Try the synthetic sample workspace</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Samples exercise the review workflow without video. They are always visibly separated
          from real YOLO results.
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
                  Run synthetic sample
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Full catalog:{" "}
          <Link href="/dashboard/demo-footage" className="font-medium text-primary hover:underline">
             Sample Footage Library
          </Link>
        </p>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Synthetic CCTV scenarios — Barasat pilot</h2>
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
                  {feed.status === "demo" ? "sample" : feed.status}
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
                  Run sample analysis
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
        . Real processing is worker-based, authorization-gated, privacy-masked, and human-reviewed.
      </p>
    </div>
  );
}
