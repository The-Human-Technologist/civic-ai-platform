import { NextResponse } from "next/server";
import {
  createProcessingJob,
  listProcessingJobs,
  saveProcessingDetections,
  updateProcessingJob,
} from "@/lib/db/processing-jobs";
import { runMockProcessingJob } from "@/lib/processing/mock";
import type { CreateProcessingJobInput, ProcessingMode } from "@/lib/processing/types";

type CreateJobPayload = {
  sourceType?: CreateProcessingJobInput["sourceType"];
  videoName?: string;
  demoId?: string;
};

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
  const body = (await request.json().catch(() => ({}))) as CreateJobPayload;
  const sourceType = body.sourceType ?? "synthetic_demo";
  const mode = getProcessingMode();

  const job = await createProcessingJob({
    sourceType,
    videoName: body.videoName,
    demoId: body.demoId,
    mode,
  });

  // Vercel/frontend route only creates small metadata jobs.
  // Real uploaded video must be processed in a separate worker, never inline here.
  if (mode === "mock") {
    await updateProcessingJob(job.id, {
      status: "running_detection",
      progress: 55,
    });

    const mockResult = await runMockProcessingJob(job);
    await saveProcessingDetections(job.id, mockResult.detections);
    const completed = await updateProcessingJob(job.id, {
      status: "completed",
      progress: 100,
    });

    return NextResponse.json(
      {
        job: completed ?? job,
        mode,
        eventCount: mockResult.eventCount,
        framesAnalyzed: mockResult.framesAnalyzed,
        processingMs: mockResult.processingMs,
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
      note: "Worker mode is scaffolded only. Route created the job, but a separate backend worker must do frame extraction, privacy masking, and detection.",
    },
    { status: 201 },
  );
}
