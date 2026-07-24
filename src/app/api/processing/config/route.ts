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
      "Real inference requires the separately running AI worker.",
      "Direct analysis accepts authorized uploaded clips and deletes them after processing.",
      "Persistent municipal storage stays disabled unless explicit storage flags are configured.",
      "Authorized footage is required for any real pilot.",
      "No facial recognition.",
      "No automatic challan.",
      "Human review required.",
      "Standard weights detect people and vehicles; specialist civic classes need custom weights.",
    ],
  });
}
