import { NextResponse } from "next/server";
import {
  createProcessingJob,
  listProcessingJobs,
  saveProcessingDetections,
  updateProcessingJob,
} from "@/lib/db/processing-jobs";
import { runMockProcessingJob } from "@/lib/processing/mock";
import {
  isWorkerConfigured,
  isWorkerModeEnabled,
  processDemoJobWithWorker,
  processVideoJobWithWorker,
} from "@/lib/processing/worker-client";
import type {
  CreateProcessingJobRequest,
  ProcessingMode,
} from "@/lib/processing/types";

function getProcessingMode(): ProcessingMode {
  return process.env.AI_PROCESSING_MODE === "worker" ? "worker" : "mock";
}

export async function GET() {
  const jobs = await listProcessingJobs(10);
  return NextResponse.json({
    jobs,
    mode: getProcessingMode(),
    workerModeEnabled: isWorkerModeEnabled(),
    workerConfigured: isWorkerConfigured(),
    note: "Processing jobs are metadata only in the public alpha. Large video processing must run in a separate worker service.",
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CreateProcessingJobRequest;
  const sourceType = body.sourceType ?? "synthetic_demo";
  const serverMode = getProcessingMode();
  const requestedMode = body.requestedMode ?? "mock";
  const workerConfigured = isWorkerConfigured();
  const workerModeEnabled = isWorkerModeEnabled();
  const mode =
    requestedMode === "worker" && serverMode === "worker" && workerModeEnabled ? "worker" : "mock";

  const job = await createProcessingJob({
    sourceType,
    videoName: body.videoName,
    demoId: body.demoId,
    locationLabel: body.locationLabel,
    selectedScenario: body.selectedScenario,
    mode,
    requestedMode,
  });

  // Vercel/frontend route only creates small metadata jobs.
  // Real uploaded video must be processed in a separate worker, never inline here.
  if (mode === "mock") {
    await updateProcessingJob(job.id, {
      status: "extracting_frames",
      progress: 20,
    });
    await new Promise((resolve) => setTimeout(resolve, 120));
    await updateProcessingJob(job.id, {
      status: "masking_privacy",
      progress: 40,
    });
    await new Promise((resolve) => setTimeout(resolve, 120));
    await updateProcessingJob(job.id, {
      status: "running_detection",
      progress: 65,
    });

    const mockResult = await runMockProcessingJob(job);
    await updateProcessingJob(job.id, {
      status: "saving_results",
      progress: 90,
    });
    await saveProcessingDetections(job.id, mockResult.detections);
    const completed = await updateProcessingJob(job.id, {
      status: "completed",
      progress: 100,
    });

    return NextResponse.json(
      {
        job: completed ?? job,
        detections: mockResult.detections,
        mode,
        workerModeEnabled,
        workerConfigured,
        limitations: [
          "Mock AI remains the default public path.",
          "Real video bytes are not uploaded yet.",
          "No live CCTV or RTSP support.",
          "Human review is still required.",
        ],
        eventCount: mockResult.eventCount,
        framesAnalyzed: mockResult.framesAnalyzed,
        processingMs: mockResult.processingMs,
        note:
          sourceType === "uploaded_video"
            ? "Metadata-only mock job created. No video bytes were uploaded in the public alpha."
            : "Mock processing job completed. Real worker-based video processing remains scaffolded only.",
      },
      { status: 201 },
    );
  }

  const queued = await updateProcessingJob(job.id, {
    status: "queued",
    progress: 5,
  });

  const processResult =
    sourceType === "synthetic_demo"
      ? await processDemoJobWithWorker(queued ?? job)
      : await processVideoJobWithWorker(queued ?? job);

  if (!processResult.ok) {
    const failedJob = await updateProcessingJob(job.id, {
      status: "failed",
      progress: 5,
      error: processResult.error,
    });

    return NextResponse.json(
      {
        job: failedJob ?? job,
        mode,
        workerModeEnabled,
        workerConfigured,
        limitations: [
          "Worker mode is feature-flagged.",
          "Real video bytes are still disabled.",
          "No live CCTV or RTSP support.",
          "No real inference is bundled in this repository.",
        ],
        note:
          sourceType === "uploaded_video"
            ? "Worker mode is enabled, but real video byte upload is not implemented yet."
            : "Worker mode is enabled, but the worker is offline or failed to respond.",
      },
      { status: 201 },
    );
  }

  const workerData = processResult.data;
  await updateProcessingJob(job.id, { status: "extracting_frames", progress: 20 });
  await updateProcessingJob(job.id, { status: "masking_privacy", progress: 40 });
  await updateProcessingJob(job.id, { status: "running_detection", progress: 70 });
  await updateProcessingJob(job.id, { status: "saving_results", progress: 90 });
  await saveProcessingDetections(job.id, workerData.detections);
  const finalJob = await updateProcessingJob(job.id, {
    status: workerData.status,
    progress: workerData.progress,
    error: workerData.error,
  });

  return NextResponse.json(
    {
      job: finalJob ?? job,
      detections: workerData.detections,
      mode,
      workerModeEnabled,
      workerConfigured,
      limitations: workerData.limitations,
      note: workerData.note,
    },
    { status: 201 },
  );
}
