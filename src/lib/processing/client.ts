import type {
  CreateProcessingJobRequest,
  ProcessingJobResponse,
  ProcessingJobsListResponse,
} from "@/lib/processing/types";

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    const message =
      typeof data === "object" && data && "error" in data && data.error
        ? data.error
        : `Processing API request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}

export async function createProcessingJob(
  input: CreateProcessingJobRequest,
): Promise<ProcessingJobResponse> {
  const response = await fetch("/api/processing/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJson<ProcessingJobResponse>(response);
}

export async function getProcessingJob(jobId: string): Promise<ProcessingJobResponse> {
  const response = await fetch(`/api/processing/jobs/${encodeURIComponent(jobId)}`, {
    method: "GET",
    cache: "no-store",
  });
  return readJson<ProcessingJobResponse>(response);
}

export async function listProcessingJobs(): Promise<ProcessingJobsListResponse> {
  const response = await fetch("/api/processing/jobs", {
    method: "GET",
    cache: "no-store",
  });
  return readJson<ProcessingJobsListResponse>(response);
}

export async function pollProcessingJob(
  jobId: string,
  options?: {
    intervalMs?: number;
    timeoutMs?: number;
    shouldStop?: (result: ProcessingJobResponse) => boolean;
  },
): Promise<ProcessingJobResponse> {
  const intervalMs = options?.intervalMs ?? 1000;
  const timeoutMs = options?.timeoutMs ?? 20000;
  const deadline = Date.now() + timeoutMs;

  let latest = await getProcessingJob(jobId);
  const stop =
    options?.shouldStop ??
    ((result: ProcessingJobResponse) =>
      result.job.status === "completed" || result.job.status === "failed");

  while (!stop(latest)) {
    if (Date.now() >= deadline) {
      throw new Error("Timed out while polling processing job status");
    }
    await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
    latest = await getProcessingJob(jobId);
  }

  return latest;
}
