import type { StorageProvider } from "@/lib/storage/types";

const DEFAULT_RETENTION_DAYS = 30;
const DEFAULT_MAX_UPLOAD_MB = 250;

export function isAuthorizedUploadEnabled(): boolean {
  return process.env.AUTHORIZED_UPLOADS_ENABLED === "true";
}

export function getStorageLimitBytes(): number {
  const maxUploadMb = Number(process.env.MAX_AUTHORIZED_VIDEO_UPLOAD_MB || DEFAULT_MAX_UPLOAD_MB);
  if (Number.isNaN(maxUploadMb) || maxUploadMb <= 0) {
    return DEFAULT_MAX_UPLOAD_MB * 1024 * 1024;
  }
  return Math.round(maxUploadMb * 1024 * 1024);
}

export function getStorageConfig(): {
  authorizedUploadsEnabled: boolean;
  storageProvider: StorageProvider;
  maxAuthorizedVideoUploadMb: number;
  maxAuthorizedVideoUploadBytes: number;
  authorizedFootageRetentionDays: number;
  s3Configured: boolean;
  limitations: string[];
} {
  const storageProvider = (process.env.STORAGE_PROVIDER || "disabled") as StorageProvider;
  const maxAuthorizedVideoUploadBytes = getStorageLimitBytes();
  const maxAuthorizedVideoUploadMb = Math.round(maxAuthorizedVideoUploadBytes / (1024 * 1024));
  const authorizedFootageRetentionDays =
    Number(process.env.AUTHORIZED_FOOTAGE_RETENTION_DAYS || DEFAULT_RETENTION_DAYS) ||
    DEFAULT_RETENTION_DAYS;
  const s3Configured = Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_REGION &&
      process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY,
  );

  const limitations = [
    "Public uploads stay disabled by default.",
    "No raw footage is stored in the repository.",
    "No live CCTV or RTSP ingestion is enabled.",
    "Privacy masking is required before evidence persistence.",
  ];

  return {
    authorizedUploadsEnabled: isAuthorizedUploadEnabled(),
    storageProvider,
    maxAuthorizedVideoUploadMb,
    maxAuthorizedVideoUploadBytes,
    authorizedFootageRetentionDays,
    s3Configured,
    limitations,
  };
}
