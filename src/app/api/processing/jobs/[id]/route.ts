import { NextResponse } from "next/server";
import {
  getProcessingJob,
  listProcessingDetections,
  updateProcessingJob,
} from "@/lib/db/processing-jobs";
import { isWorkerConfigured, isWorkerModeEnabled } from "@/lib/processing/worker-client";
import type { ProcessingJobStatus } from "@/lib/processing/types";

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
  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as PatchPayload;

  const job = await updateProcessingJob(id, {
    status: body.status,
    progress: body.progress,
    error: body.error,
  });

  if (!job) {
    return NextResponse.json({ error: "Processing job not found" }, { status: 404 });
  }

  return NextResponse.json({ job });
}
