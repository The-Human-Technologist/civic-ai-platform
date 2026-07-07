import { randomUUID } from "node:crypto";
import { getDb, hasMongoConfig } from "@/lib/db/mongodb";
import type {
  CreateProcessingJobInput,
  ProcessingDetection,
  ProcessingJob,
} from "@/lib/processing/types";

const JOBS_COLLECTION = "processing_jobs";
const DETECTIONS_COLLECTION = "processing_detections";

// In-memory fallback keeps local demo/dev usable without MongoDB.
// It is intentionally non-persistent and must not be treated as production storage.
const inMemoryJobs = new Map<string, ProcessingJob>();
const inMemoryDetections = new Map<string, ProcessingDetection[]>();

function nowIso(): string {
  return new Date().toISOString();
}

export function shouldUseInMemoryStore(): boolean {
  return !hasMongoConfig();
}

export async function createProcessingJob(
  input: CreateProcessingJobInput,
): Promise<ProcessingJob> {
  const timestamp = nowIso();
  const job: ProcessingJob = {
    id: randomUUID(),
    sourceType: input.sourceType,
    status: "queued",
    progress: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    videoName: input.videoName,
    demoId: input.demoId,
    locationLabel: input.locationLabel,
    selectedScenario: input.selectedScenario,
    mode: input.mode,
    requestedMode: input.requestedMode ?? input.mode,
  };

  if (shouldUseInMemoryStore()) {
    inMemoryJobs.set(job.id, job);
    return job;
  }

  const db = await getDb();
  await db.collection<ProcessingJob>(JOBS_COLLECTION).insertOne(job);
  return job;
}

export async function getProcessingJob(id: string): Promise<ProcessingJob | null> {
  if (shouldUseInMemoryStore()) {
    return inMemoryJobs.get(id) ?? null;
  }

  const db = await getDb();
  return db.collection<ProcessingJob>(JOBS_COLLECTION).findOne({ id });
}

export async function listProcessingJobs(limit = 10): Promise<ProcessingJob[]> {
  if (shouldUseInMemoryStore()) {
    return [...inMemoryJobs.values()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  const db = await getDb();
  return db
    .collection<ProcessingJob>(JOBS_COLLECTION)
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function updateProcessingJob(
  id: string,
  patch: Partial<Omit<ProcessingJob, "id" | "createdAt">>,
): Promise<ProcessingJob | null> {
  const existing = await getProcessingJob(id);
  if (!existing) return null;

  const nextJob: ProcessingJob = {
    ...existing,
    ...patch,
    updatedAt: nowIso(),
  };

  if (shouldUseInMemoryStore()) {
    inMemoryJobs.set(id, nextJob);
    return nextJob;
  }

  const db = await getDb();
  await db
    .collection<ProcessingJob>(JOBS_COLLECTION)
    .updateOne({ id }, { $set: nextJob });
  return nextJob;
}

export async function saveProcessingDetections(
  jobId: string,
  detections: ProcessingDetection[],
): Promise<void> {
  if (shouldUseInMemoryStore()) {
    inMemoryDetections.set(jobId, detections);
    return;
  }

  const db = await getDb();
  await db.collection(DETECTIONS_COLLECTION).deleteMany({ jobId });
  if (detections.length > 0) {
    await db.collection<ProcessingDetection>(DETECTIONS_COLLECTION).insertMany(detections);
  }
}

export async function listProcessingDetections(
  jobId: string,
): Promise<ProcessingDetection[]> {
  if (shouldUseInMemoryStore()) {
    return inMemoryDetections.get(jobId) ?? [];
  }

  const db = await getDb();
  return db
    .collection<ProcessingDetection>(DETECTIONS_COLLECTION)
    .find({ jobId })
    .toArray();
}
