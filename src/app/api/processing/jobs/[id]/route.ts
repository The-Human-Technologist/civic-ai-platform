import { NextResponse } from "next/server";
import {
  getProcessingJob,
  listProcessingDetections,
  updateProcessingJob,
} from "@/lib/db/processing-jobs";
import { isWorkerConfigured, isWorkerModeEnabled } from "@/lib/processing/worker-client";
import type { ProcessingJobStatus } from "@/lib/processing/types";
import { PROCESSING_JOB_STATUSES } from "@/lib/processing/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type PatchPayload = {
  status?: ProcessingJobStatus;
  progress?: number;
  error?: string;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const job = await getProcessingJob(id);

  if (!job) {
    return NextResponse.json({ error: "Processing job not found" }, { status: 404 });
  }

  const detections = await listProcessingDetections(id);
  const workerModeEnabled = isWorkerModeEnabled();
  const workerConfigured = isWorkerConfigured();
  const note =
    job.sourceType === "authorized_pilot_clip"
      ? "This job is linked to an authorized pilot footage intake scaffold. Real storage-backed processing still requires explicit upload and privacy controls."
      : job.sourceType === "uploaded_video"
      ? "This is a metadata-only uploaded-video job in the public alpha. Real video execution still belongs in a separate worker service."
      : "This mock processing job represents the future worker flow using synthetic/public-safe demo inputs only.";
  const limitations = [
    "Mock mode remains the safe default.",
    "Real video byte upload is still disabled.",
    "Live CCTV and RTSP remain out of scope.",
    "Human review remains required.",
  ];

  return NextResponse.json({
    job,
    detections,
    note,
    workerModeEnabled,
    workerConfigured,
    limitations,
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  if (process.env.ALLOW_DEV_JOB_MUTATIONS !== "true") {
    return NextResponse.json(
      { error: "Direct job mutations are disabled. Worker-controlled status updates are required." },
      { status: 403 },
    );
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as PatchPayload;

  if (body.status && !PROCESSING_JOB_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid processing job status." }, { status: 400 });
  }
  if (
    body.progress !== undefined &&
    (!Number.isFinite(body.progress) || body.progress < 0 || body.progress > 100)
  ) {
    return NextResponse.json({ error: "progress must be between 0 and 100." }, { status: 400 });
  }

  const patch: PatchPayload = {};
  if (body.status !== undefined) patch.status = body.status;
  if (body.progress !== undefined) patch.progress = body.progress;
  if (typeof body.error === "string") patch.error = body.error.slice(0, 1000);

  let job;
  try {
    job = await updateProcessingJob(id, patch);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid job update." },
      { status: 400 },
    );
  }

  if (!job) {
    return NextResponse.json({ error: "Processing job not found" }, { status: 404 });
  }

  return NextResponse.json({ job });
}
