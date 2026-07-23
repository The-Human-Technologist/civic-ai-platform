import {
  PROCESSING_MODES,
  type CreateProcessingJobRequest,
  type ProcessingMode,
  type ProcessingSourceType,
} from "@/lib/processing/types";

const SOURCE_TYPES: ProcessingSourceType[] = [
  "synthetic_demo",
  "uploaded_video",
  "authorized_pilot_clip",
];

function optionalText(value: unknown, maxLength: number): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") throw new Error("Text fields must be strings.");
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) {
    throw new Error(`Text fields must contain 1-${maxLength} characters.`);
  }
  return normalized;
}

export function parseCreateProcessingJobRequest(value: unknown): CreateProcessingJobRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("A JSON object is required.");
  }

  const body = value as Record<string, unknown>;
  const sourceType = body.sourceType;
  if (typeof sourceType !== "string" || !SOURCE_TYPES.includes(sourceType as ProcessingSourceType)) {
    throw new Error("A valid sourceType is required.");
  }

  const requestedModeValue = body.requestedMode ?? "mock";
  if (
    typeof requestedModeValue !== "string" ||
    !PROCESSING_MODES.includes(requestedModeValue as ProcessingMode)
  ) {
    throw new Error("requestedMode must be mock or worker.");
  }

  const retentionDays = body.retentionDays;
  if (
    retentionDays !== undefined &&
    (typeof retentionDays !== "number" ||
      !Number.isInteger(retentionDays) ||
      retentionDays < 1 ||
      retentionDays > 365)
  ) {
    throw new Error("retentionDays must be an integer between 1 and 365.");
  }

  const request: CreateProcessingJobRequest = {
    sourceType: sourceType as ProcessingSourceType,
    requestedMode: requestedModeValue as ProcessingMode,
    demoId: optionalText(body.demoId, 120),
    videoName: optionalText(body.videoName, 240),
    authorizedFootageIntakeId: optionalText(body.authorizedFootageIntakeId, 120),
    storageObjectKey: optionalText(body.storageObjectKey, 500),
    locationLabel: optionalText(body.locationLabel, 240),
    selectedScenario: optionalText(body.selectedScenario, 500),
    privacyMaskingRequired:
      typeof body.privacyMaskingRequired === "boolean" ? body.privacyMaskingRequired : undefined,
    retentionDays: retentionDays as number | undefined,
  };

  if (request.sourceType === "synthetic_demo" && !request.demoId) {
    throw new Error("Synthetic demo jobs require demoId.");
  }
  if (request.sourceType === "uploaded_video" && !request.videoName) {
    throw new Error("Uploaded-video metadata jobs require videoName.");
  }
  if (request.sourceType === "authorized_pilot_clip" && !request.authorizedFootageIntakeId) {
    throw new Error("Authorized pilot jobs require authorizedFootageIntakeId.");
  }

  return request;
}
