import { NextResponse } from "next/server";
import {
  createProcessingJob,
  listProcessingJobs,
  listProcessingDetections,
  saveProcessingDetections,
  updateProcessingJob,
} from "@/lib/db/processing-jobs";
import { runMockProcessingJob } from "@/lib/processing/mock";
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
    note: "Processing jobs are metadata only in the public alpha. Large video processing must run in a separate worker service.",
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CreateProcessingJobRequest;
  const sourceType = body.sourceType ?? "synthetic_demo";
  const serverMode = getProcessingMode();
  const requestedMode = body.requestedMode ?? "mock";
  const workerConfigured = Boolean(process.env.AI_WORKER_URL);
  const mode =
    requestedMode === "worker" && serverMode === "worker" && workerConfigured ? "worker" : "mock";

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

  return NextResponse.json(
    {
      job: queued ?? job,
      mode,
      detections: await listProcessingDetections(job.id),
      note:
        requestedMode === "worker" && !workerConfigured
          ? "Worker mode is scaffolded but not enabled in this deployment."
          : "Worker mode is scaffolded only. Route created the job, but a separate backend worker must do frame extraction, privacy masking, and detection.",
    },
    { status: 201 },
  );
}
