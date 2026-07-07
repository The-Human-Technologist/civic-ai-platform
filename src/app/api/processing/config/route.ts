import { NextResponse } from "next/server";
import { hasMongoConfig } from "@/lib/db/mongodb";
import { isWorkerConfigured, isWorkerModeEnabled } from "@/lib/processing/worker-client";
import { getStorageConfig } from "@/lib/storage/config";

export async function GET() {
  const aiProcessingMode = process.env.AI_PROCESSING_MODE === "worker" ? "worker" : "mock";
  const workerConfigured = isWorkerConfigured();
  const mongoConfigured = hasMongoConfig();
  const storageConfig = getStorageConfig();

  return NextResponse.json({
    aiProcessingMode,
    workerConfigured,
    workerModeEnabled: isWorkerModeEnabled(),
    mongoConfigured,
    authorizedUploadsEnabled: storageConfig.authorizedUploadsEnabled,
    storageProvider: storageConfig.storageProvider,
    maxAuthorizedVideoUploadMb: storageConfig.maxAuthorizedVideoUploadMb,
    publicLimitations: [
      "Mock AI is the default in public alpha.",
      "Real video bytes are not uploaded yet.",
      "Worker mode is feature-flagged and scaffolded only.",
      "Authorized pilot uploads are disabled unless explicit storage flags are configured.",
      "Authorized footage is required for any real pilot.",
      "No facial recognition.",
      "No automatic challan.",
      "Human review required.",
    ],
  });
}
