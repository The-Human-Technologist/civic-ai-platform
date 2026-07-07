import { NextResponse } from "next/server";
import {
  getProcessingJob,
  listProcessingDetections,
  updateProcessingJob,
} from "@/lib/db/processing-jobs";
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
  return NextResponse.json({
    job,
    detections,
    note: "This endpoint reports job metadata only. Real uploaded-video execution belongs in a separate worker service.",
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
