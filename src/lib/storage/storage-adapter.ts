import { randomUUID } from "node:crypto";
import { getStorageConfig } from "@/lib/storage/config";
import type {
  PresignedUploadRequest,
  PresignedUploadResponse,
} from "@/lib/storage/types";

const ALLOWED_CONTENT_TYPES = new Set(["video/mp4", "video/quicktime", "video/webm"]);

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export function createStorageObjectKey(intakeId: string, fileName: string): string {
  const safeName = sanitizeFileName(fileName);
  return `authorized-footage/${intakeId}/${randomUUID()}-${safeName}`;
}

export function validateAuthorizedUploadRequest(
  request: PresignedUploadRequest,
): { valid: boolean; message?: string } {
  const storageConfig = getStorageConfig();

  if (!ALLOWED_CONTENT_TYPES.has(request.contentType)) {
    return {
      valid: false,
      message: "Only MP4, QuickTime, and WebM metadata requests are supported.",
    };
  }

  if (request.fileSizeBytes <= 0 || request.fileSizeBytes > storageConfig.maxAuthorizedVideoUploadBytes) {
    return {
      valid: false,
      message: `Authorized upload metadata must be under ${storageConfig.maxAuthorizedVideoUploadMb} MB.`,
    };
  }

  return { valid: true };
}

export async function createPresignedUploadUrl(
  request: PresignedUploadRequest,
): Promise<PresignedUploadResponse> {
  const storageConfig = getStorageConfig();
  const validation = validateAuthorizedUploadRequest(request);

  if (!validation.valid) {
    return {
      enabled: false,
      limitations: storageConfig.limitations,
      message: validation.message ?? "Invalid authorized upload request.",
    };
  }

  if (!storageConfig.authorizedUploadsEnabled) {
    return {
      enabled: false,
      limitations: storageConfig.limitations,
      message:
        "Authorized footage uploads are disabled in public alpha. Configure storage and explicit env flags for controlled pilot use.",
    };
  }

  if (storageConfig.storageProvider === "disabled") {
    return {
      enabled: false,
      limitations: storageConfig.limitations,
      message:
        "Storage provider is disabled. Enable a controlled storage backend before issuing upload URLs.",
    };
  }

  if (storageConfig.storageProvider === "local_dev_metadata_only") {
    return {
      enabled: false,
      limitations: [
        ...storageConfig.limitations,
        "Local dev metadata-only mode does not write footage files anywhere.",
      ],
      message:
        "Local dev metadata-only mode is active. Real file upload is intentionally disabled.",
    };
  }

  if (!storageConfig.s3Configured) {
    return {
      enabled: false,
      limitations: storageConfig.limitations,
      message:
        "S3-compatible storage is selected but not fully configured. Add the bucket config and short-lived signing flow before pilot use.",
    };
  }

  const objectKey = createStorageObjectKey(request.intakeId, request.fileName);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  return {
    enabled: false,
    objectKey,
    expiresAt,
    limitations: [
      ...storageConfig.limitations,
      "Presigned URL generation is scaffolded only until storage credentials are deliberately enabled.",
    ],
    message:
      "Storage configuration is present, but presigned upload issuance is still scaffolded. Keep public uploads disabled until legal and security review is complete.",
  };
}
