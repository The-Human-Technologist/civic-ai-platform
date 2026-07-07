import type { ReviewStatus, Severity } from "@/types";

export const PROCESSING_MODES = ["mock", "worker"] as const;
export type ProcessingMode = (typeof PROCESSING_MODES)[number];

export const PROCESSING_JOB_STATUSES = [
  "queued",
  "extracting_frames",
  "masking_privacy",
  "running_detection",
  "saving_results",
  "completed",
  "failed",
] as const;
export type ProcessingJobStatus = (typeof PROCESSING_JOB_STATUSES)[number];

export const CIVIC_DETECTION_CLASSES = [
  "pothole",
  "waterlogging",
  "garbage_overflow",
  "illegal_parking",
  "road_blockage",
  "congestion",
  "wrong_way_driving",
  "unknown",
] as const;
export type CivicDetectionClass = (typeof CIVIC_DETECTION_CLASSES)[number];

export type ProcessingSourceType =
  | "synthetic_demo"
  | "uploaded_video"
  | "authorized_pilot_clip";

export interface ProcessingBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProcessingJob {
  id: string;
  sourceType: ProcessingSourceType;
  status: ProcessingJobStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
  videoName?: string;
  demoId?: string;
  locationLabel?: string;
  selectedScenario?: string;
  mode: ProcessingMode;
  requestedMode?: ProcessingMode;
  error?: string;
}

export interface ProcessingDetection {
  id: string;
  jobId: string;
  type: CivicDetectionClass;
  confidence: number;
  severity: Severity;
  locationLabel: string;
  frameTimestampSec?: number;
  boundingBox?: ProcessingBoundingBox;
  privacyMasked: boolean;
  humanReviewStatus: ReviewStatus;
}

export interface ProcessingJobWithDetections extends ProcessingJob {
  detections: ProcessingDetection[];
}

export interface CreateProcessingJobInput {
  sourceType: ProcessingSourceType;
  videoName?: string;
  demoId?: string;
  mode: ProcessingMode;
  locationLabel?: string;
  selectedScenario?: string;
  requestedMode?: ProcessingMode;
}

export interface CreateProcessingJobRequest {
  sourceType: ProcessingSourceType;
  demoId?: string;
  videoName?: string;
  locationLabel?: string;
  selectedScenario?: string;
  requestedMode?: ProcessingMode;
}

export interface ProcessingJobsListResponse {
  jobs: ProcessingJob[];
  mode: ProcessingMode;
  note: string;
}

export interface ProcessingJobResponse {
  job: ProcessingJob;
  detections?: ProcessingDetection[];
  mode?: ProcessingMode;
  note?: string;
  eventCount?: number;
  framesAnalyzed?: number;
  processingMs?: number;
}
