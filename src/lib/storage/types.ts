export const AUTHORIZED_FOOTAGE_INTAKE_STATUSES = [
  "draft",
  "awaiting_authorization",
  "authorized",
  "upload_url_issued",
  "uploaded",
  "queued_for_processing",
  "rejected",
  "expired",
] as const;

export type AuthorizedFootageIntakeStatus =
  (typeof AUTHORIZED_FOOTAGE_INTAKE_STATUSES)[number];

export const AUTHORIZED_FOOTAGE_SOURCE_TYPES = [
  "municipal_uploaded_clip",
  "traffic_department_clip",
  "ward_office_clip",
  "synthetic_demo",
  "external_dataset_reference",
] as const;

export type AuthorizedFootageSourceType =
  (typeof AUTHORIZED_FOOTAGE_SOURCE_TYPES)[number];

export const STORAGE_PROVIDERS = [
  "disabled",
  "s3_compatible",
  "local_dev_metadata_only",
] as const;

export type StorageProvider = (typeof STORAGE_PROVIDERS)[number];

export interface AuthorizedFootageIntake {
  id: string;
  title: string;
  sourceType: AuthorizedFootageSourceType;
  locationLabel: string;
  jurisdiction: string;
  authorizationContact: string;
  authorizationReference?: string;
  authorizationDate?: string;
  retentionDays: number;
  privacyMaskingRequired: boolean;
  plateMaskingRequired: boolean;
  faceBlurRequired: boolean;
  status: AuthorizedFootageIntakeStatus;
  storageObjectKey?: string;
  originalFileName?: string;
  fileSizeBytes?: number;
  contentType?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  humanReviewRequired?: boolean;
}

export interface CreateAuthorizedFootageIntakeInput {
  title: string;
  sourceType: AuthorizedFootageSourceType;
  locationLabel: string;
  jurisdiction: string;
  authorizationContact: string;
  authorizationReference?: string;
  authorizationDate?: string;
  retentionDays: number;
  privacyMaskingRequired: boolean;
  plateMaskingRequired: boolean;
  faceBlurRequired: boolean;
  status?: AuthorizedFootageIntakeStatus;
  storageObjectKey?: string;
  originalFileName?: string;
  fileSizeBytes?: number;
  contentType?: string;
  notes?: string;
  humanReviewRequired?: boolean;
}

export interface PresignedUploadRequest {
  intakeId: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
}

export interface PresignedUploadResponse {
  enabled: boolean;
  uploadUrl?: string;
  objectKey?: string;
  expiresAt?: string;
  limitations: string[];
  message: string;
}
