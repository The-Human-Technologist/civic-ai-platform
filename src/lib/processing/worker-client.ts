import type { ProcessingDetection, ProcessingJob } from "@/lib/processing/types";

type WorkerHealthPayload = {
  ok: boolean;
  service: string;
  mode: string;
  realInferenceEnabled: boolean;
  modelName?: string;
  modelAvailable?: boolean;
  device?: string;
  privacyMaskingEnabled?: boolean;
};

type WorkerProcessPayload = {
  jobId: string;
  status: ProcessingJob["status"];
  progress: number;
  detections: ProcessingDetection[];
  limitations: string[];
  note: string;
  error?: string;
  modelName?: string;
  device?: string;
  realInferenceEnabled: boolean;
  framesAnalyzed: number;
  processingMs: number;
  objectsDetected: number;
  classCounts: Record<string, number>;
};

type WorkerCallResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const WORKER_TIMEOUT_MS = 8000;
const VIDEO_WORKER_TIMEOUT_MS = 5 * 60 * 1000;

function getWorkerUrl(): string | null {
  return process.env.AI_WORKER_URL?.trim() || null;
}

export function isWorkerModeEnabled(): boolean {
  return process.env.AI_PROCESSING_MODE === "worker" && isWorkerConfigured();
}

export function isWorkerConfigured(): boolean {
  return Boolean(getWorkerUrl());
}

async function fetchWithTimeout(
  input: string,
  init?: RequestInit,
  timeoutMs = WORKER_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timeout);
  }
}

async function callWorker<T>(path: string, init?: RequestInit): Promise<WorkerCallResult<T>> {
  const workerUrl = getWorkerUrl();
  if (!workerUrl) {
    return { ok: false, error: "Worker mode is not enabled in this deployment." };
  }

  try {
    const response = await fetchWithTimeout(`${workerUrl}${path}`, init);
    const payload = (await response.json().catch(() => ({}))) as T & {
      error?: string;
      detail?: string;
    };

    if (!response.ok) {
      return {
        ok: false,
        error:
          payload.error ||
          payload.detail ||
          `Worker request failed with status ${response.status}`,
      };
    }

    return { ok: true, data: payload as T };
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Worker request timed out."
        : error instanceof Error
          ? error.message
          : "Worker is offline or unreachable.";
    return { ok: false, error: message };
  }
}

async function callWorkerWithTimeout<T>(
  path: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<WorkerCallResult<T>> {
  const workerUrl = getWorkerUrl();
  if (!workerUrl) return { ok: false, error: "AI worker URL is not configured." };
  try {
    const response = await fetchWithTimeout(`${workerUrl}${path}`, init, timeoutMs);
    const payload = (await response.json().catch(() => ({}))) as T & {
      error?: string;
      detail?: string;
    };
    if (!response.ok) {
      return {
        ok: false,
        error: payload.error || payload.detail || `Worker request failed (${response.status}).`,
      };
    }
    return { ok: true, data: payload as T };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error && error.name === "AbortError"
          ? "Video processing timed out after five minutes."
          : error instanceof Error
            ? error.message
            : "AI worker is offline or unreachable.",
    };
  }
}

export async function callWorkerHealth(): Promise<WorkerCallResult<WorkerHealthPayload>> {
  if (!isWorkerModeEnabled()) {
    return { ok: false, error: "Worker mode is not enabled." };
  }

  return callWorker<WorkerHealthPayload>("/health", { method: "GET" });
}

export async function processDemoJobWithWorker(
  job: ProcessingJob,
): Promise<WorkerCallResult<WorkerProcessPayload>> {
  if (!isWorkerModeEnabled()) {
    return { ok: false, error: "Worker mode is not enabled." };
  }

  return callWorker<WorkerProcessPayload>("/process-sample-job", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jobId: job.id,
      demoId: job.demoId,
      sourceType: job.sourceType,
      videoName: job.videoName,
      locationLabel: job.locationLabel,
    }),
  });
}

export async function processAuthorizedVideoWithWorker(input: {
  job: ProcessingJob;
  video: File;
  locationLabel: string;
  authorizationReference: string;
}): Promise<WorkerCallResult<WorkerProcessPayload>> {
  if (!isWorkerModeEnabled()) {
    return { ok: false, error: "Real worker mode is not enabled." };
  }
  const formData = new FormData();
  formData.set("video", input.video, input.video.name);
  formData.set("jobId", input.job.id);
  formData.set("locationLabel", input.locationLabel);
  formData.set("authorizationReference", input.authorizationReference);
  formData.set("authorizationConfirmed", "true");
  return callWorkerWithTimeout<WorkerProcessPayload>(
    "/process-video",
    { method: "POST", body: formData },
    VIDEO_WORKER_TIMEOUT_MS,
  );
}
