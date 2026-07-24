import { NextResponse } from "next/server";
import {
  createProcessingJob,
  listProcessingJobs,
  saveProcessingDetections,
  updateProcessingJob,
} from "@/lib/db/processing-jobs";
import { getAuthorizedFootageIntake } from "@/lib/db/authorized-footage";
import { runMockProcessingJob } from "@/lib/processing/mock";
import {
  isWorkerConfigured,
  isWorkerModeEnabled,
  processDemoJobWithWorker,
} from "@/lib/processing/worker-client";
import type { ProcessingMode } from "@/lib/processing/types";
import { parseCreateProcessingJobRequest } from "@/lib/processing/validation";

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
    note: "Synthetic jobs are available here. Real authorized-video jobs use /api/processing/video and the separate AI worker.",
  });
}

export async function POST(request: Request) {
  let body;
  try {
    body = parseCreateProcessingJobRequest(await request.json());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid processing job request." },
      { status: 400 },
    );
  }
  const sourceType = body.sourceType;
  const serverMode = getProcessingMode();
  const requestedMode = body.requestedMode ?? "mock";
  const workerConfigured = isWorkerConfigured();
  const workerModeEnabled = isWorkerModeEnabled();
  const mode =
    requestedMode === "worker" && serverMode === "worker" && workerModeEnabled ? "worker" : "mock";

  let authorizedIntake = null;
  if (body.authorizedFootageIntakeId) {
    authorizedIntake = await getAuthorizedFootageIntake(body.authorizedFootageIntakeId);
    if (!authorizedIntake) {
      return NextResponse.json(
        { error: "Authorized footage intake not found for this processing job." },
        { status: 400 },
      );
    }
  }

  if (sourceType === "authorized_pilot_clip") {
    if (!authorizedIntake) {
      return NextResponse.json(
        {
          error:
            "authorized_pilot_clip jobs require an authorized footage intake record first.",
        },
        { status: 400 },
      );
    }

    if (authorizedIntake.status !== "uploaded") {
      return NextResponse.json(
        {
          error:
            "Authorized footage intake must be marked uploaded before creating a pilot processing job.",
        },
        { status: 400 },
      );
    }
  }

  const job = await createProcessingJob({
    sourceType,
    videoName: body.videoName,
    demoId: body.demoId,
    authorizedFootageIntakeId: body.authorizedFootageIntakeId,
    storageObjectKey: body.storageObjectKey ?? authorizedIntake?.storageObjectKey,
    locationLabel: body.locationLabel,
    selectedScenario: body.selectedScenario,
    privacyMaskingRequired:
      body.privacyMaskingRequired ?? authorizedIntake?.privacyMaskingRequired,
    retentionDays: body.retentionDays ?? authorizedIntake?.retentionDays,
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
          "This endpoint provides synthetic sample processing.",
          "Real authorized video uses /api/processing/video.",
          "No live CCTV or RTSP support.",
          "Human review is still required.",
        ],
        eventCount: mockResult.eventCount,
        framesAnalyzed: mockResult.framesAnalyzed,
        processingMs: mockResult.processingMs,
        note:
          sourceType === "uploaded_video"
            ? "Synthetic metadata workflow completed. Use the authorized-video endpoint for real inference."
            : "Synthetic sample processing completed.",
      },
      { status: 201 },
    );
  }

  const queued = await updateProcessingJob(job.id, {
    status: "queued",
    progress: 5,
  });

  if (sourceType !== "synthetic_demo") {
    const failedJob = await updateProcessingJob(job.id, {
      status: "failed",
      progress: 5,
      error: "Video bytes are required. Submit authorized clips to /api/processing/video.",
    });
    return NextResponse.json(
      {
        error: "Use /api/processing/video for real authorized-video inference.",
        job: failedJob ?? job,
      },
      { status: 400 },
    );
  }

  const processResult = await processDemoJobWithWorker(queued ?? job);

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
          "Real video uses the separate authorized-video endpoint.",
          "No live CCTV or RTSP support.",
          "Every alert requires human review.",
        ],
        note: "Worker mode is enabled, but the sample worker failed to respond.",
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
