import { randomUUID } from "node:crypto";
import { processVideoMock } from "@/lib/mock-ai/processor";
import type { ProcessingDetection, ProcessingJob } from "@/lib/processing/types";
import type { DetectionEvent } from "@/types";

function mapDetectionType(event: DetectionEvent): ProcessingDetection["type"] {
  switch (event.type) {
    case "crowd_congestion":
      return "congestion";
    case "helmet_violation":
    case "overspeeding_estimate":
    case "accident_near_miss":
      return "unknown";
    default:
      return event.type;
  }
}

export async function runMockProcessingJob(job: ProcessingJob): Promise<{
  detections: ProcessingDetection[];
  eventCount: number;
  framesAnalyzed: number;
  processingMs: number;
}> {
  const result = await processVideoMock({
    fileName: job.videoName,
    demoFootageId: job.demoId,
  });

  const detections: ProcessingDetection[] = result.events.map((event, index) => ({
    id: randomUUID(),
    jobId: job.id,
    type: mapDetectionType(event),
    confidence: event.confidence,
    severity: event.severity,
    locationLabel: event.location.name,
    frameTimestampSec: index * 4,
    boundingBox: {
      x: 0.15 + index * 0.02,
      y: 0.2 + index * 0.015,
      width: 0.32,
      height: 0.24,
    },
    privacyMasked: true,
    humanReviewStatus: event.status,
  }));

  return {
    detections,
    eventCount: result.events.length,
    framesAnalyzed: result.framesAnalyzed,
    processingMs: result.processingMs,
  };
}
