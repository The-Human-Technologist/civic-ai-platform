import type { ProcessingJobStatus } from "@/lib/processing/types";

const ALLOWED_TRANSITIONS: Record<ProcessingJobStatus, ProcessingJobStatus[]> = {
  queued: ["extracting_frames", "failed"],
  extracting_frames: ["masking_privacy", "failed"],
  masking_privacy: ["running_detection", "failed"],
  running_detection: ["saving_results", "failed"],
  saving_results: ["completed", "failed"],
  completed: [],
  failed: [],
};

export function isProcessingStatusTransitionAllowed(
  current: ProcessingJobStatus,
  next: ProcessingJobStatus,
): boolean {
  return current === next || ALLOWED_TRANSITIONS[current].includes(next);
}
