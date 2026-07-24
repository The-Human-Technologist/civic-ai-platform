import { NextResponse } from "next/server";
import {
  createProcessingJob,
  saveProcessingDetections,
  updateProcessingJob,
} from "@/lib/db/processing-jobs";
import {
  isWorkerModeEnabled,
  processAuthorizedVideoWithWorker,
} from "@/lib/processing/worker-client";
import {
  ANALYSIS_MODULES,
  type AnalysisModule,
  type ExpectedDirection,
} from "@/lib/processing/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const ALLOWED_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
]);

function textValue(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  if (!isWorkerModeEnabled()) {
    return NextResponse.json(
      { error: "Real AI worker mode is not enabled or configured." },
      { status: 503 },
    );
  }

  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected a multipart video request." }, { status: 400 });
  }

  const video = data.get("video");
  const locationLabel = textValue(data, "locationLabel");
  const authorizationReference = textValue(data, "authorizationReference");
  const authorizationConfirmed = textValue(data, "authorizationConfirmed") === "true";
  const analysisModules = textValue(data, "analysisModules")
    .split(",")
    .map((value) => value.trim())
    .filter((value): value is AnalysisModule =>
      ANALYSIS_MODULES.includes(value as AnalysisModule),
    );
  const expectedDirectionValue = textValue(data, "expectedDirection");
  const expectedDirection = expectedDirectionValue
    ? (expectedDirectionValue as ExpectedDirection)
    : undefined;
  if (!(video instanceof File) || video.size === 0) {
    return NextResponse.json({ error: "A non-empty video file is required." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(video.type)) {
    return NextResponse.json({ error: "Use MP4, WebM, MOV, or AVI video." }, { status: 415 });
  }
  const maxMb = Number(process.env.MAX_VIDEO_UPLOAD_MB ?? 250);
  if (video.size > maxMb * 1024 * 1024) {
    return NextResponse.json({ error: `Video exceeds the ${maxMb} MB limit.` }, { status: 413 });
  }
  if (!locationLabel) {
    return NextResponse.json({ error: "A location label is required." }, { status: 400 });
  }
  if (!authorizationConfirmed || !authorizationReference) {
    return NextResponse.json(
      { error: "Confirm authorization and provide an authorization or licence reference." },
      { status: 403 },
    );
  }
  if (analysisModules.length === 0) {
    return NextResponse.json({ error: "Select at least one analysis module." }, { status: 400 });
  }
  const validDirections = new Set<ExpectedDirection>([
    "left_to_right",
    "right_to_left",
    "top_to_bottom",
    "bottom_to_top",
  ]);
  if (expectedDirection && !validDirections.has(expectedDirection)) {
    return NextResponse.json({ error: "Invalid expected travel direction." }, { status: 400 });
  }
  if (analysisModules.includes("wrong_way") && !expectedDirection) {
    return NextResponse.json(
      { error: "Choose the permitted travel direction for wrong-way analysis." },
      { status: 400 },
    );
  }

  const job = await createProcessingJob({
    sourceType: "authorized_pilot_clip",
    videoName: video.name,
    locationLabel,
    privacyMaskingRequired: true,
    retentionDays: 0,
    mode: "worker",
    requestedMode: "worker",
  });

  await updateProcessingJob(job.id, { status: "extracting_frames", progress: 20 });
  await updateProcessingJob(job.id, { status: "masking_privacy", progress: 40 });
  await updateProcessingJob(job.id, { status: "running_detection", progress: 65 });
  const result = await processAuthorizedVideoWithWorker({
    job,
    video,
    locationLabel,
    authorizationReference,
    analysisModules,
    expectedDirection,
  });

  if (!result.ok) {
    const failed = await updateProcessingJob(job.id, {
      status: "failed",
      progress: 65,
      error: result.error,
    });
    return NextResponse.json(
      { error: result.error, job: failed ?? job },
      { status: 502 },
    );
  }

  await updateProcessingJob(job.id, { status: "saving_results", progress: 90 });
  await saveProcessingDetections(job.id, result.data.detections);
  const completed = await updateProcessingJob(job.id, {
    status: "completed",
    progress: 100,
  });
  return NextResponse.json({
    job: completed ?? job,
    detections: result.data.detections,
    limitations: result.data.limitations,
    note: result.data.note,
    modelName: result.data.modelName,
    device: result.data.device,
    realInferenceEnabled: result.data.realInferenceEnabled,
    framesAnalyzed: result.data.framesAnalyzed,
    processingMs: result.data.processingMs,
    objectsDetected: result.data.objectsDetected,
    classCounts: result.data.classCounts,
    modelsUsed: result.data.modelsUsed,
    requestedModules: result.data.requestedModules,
    moduleStatus: result.data.moduleStatus,
  });
}
