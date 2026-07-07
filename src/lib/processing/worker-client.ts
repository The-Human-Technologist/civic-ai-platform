import type { ProcessingDetection, ProcessingJob } from "@/lib/processing/types";

type WorkerHealthPayload = {
  ok: boolean;
  service: string;
  mode: string;
  realInferenceEnabled: boolean;
};

type WorkerProcessPayload = {
  jobId: string;
  status: ProcessingJob["status"];
  progress: number;
  detections: ProcessingDetection[];
  limitations: string[];
  note: string;
  error?: string;
};

type WorkerCallResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const WORKER_TIMEOUT_MS = 8000;

function getWorkerUrl(): string | null {
  return process.env.AI_WORKER_URL?.trim() || null;
}

export function isWorkerModeEnabled(): boolean {
  return process.env.AI_PROCESSING_MODE === "worker" && isWorkerConfigured();
}

export function isWorkerConfigured(): boolean {
  return Boolean(getWorkerUrl());
}

async function fetchWithTimeout(input: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WORKER_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timeout);
  }
}

async function callWorker<T>(path: string, init?: RequestInit): Promise<WorkerCallResult<T>> {
  const workerUrl = getWorkerUrl();
  if (!workerUrl) {
    return { ok: false, error: "Worker mode is scaffolded but not enabled in this deployment." };
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

  return callWorker<WorkerProcessPayload>("/process-demo-job", {
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

export async function processVideoJobWithWorker(
  job: ProcessingJob,
): Promise<WorkerCallResult<WorkerProcessPayload>> {
  if (!isWorkerModeEnabled()) {
    return { ok: false, error: "Worker mode is not enabled." };
  }

  return callWorker<WorkerProcessPayload>("/process-video-job", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jobId: job.id,
      sourceType: job.sourceType,
      videoName: job.videoName,
      locationLabel: job.locationLabel,
      selectedScenario: job.selectedScenario,
    }),
  });
}
