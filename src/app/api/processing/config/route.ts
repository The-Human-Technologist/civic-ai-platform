import { NextResponse } from "next/server";
import { hasMongoConfig } from "@/lib/db/mongodb";

export async function GET() {
  const aiProcessingMode = process.env.AI_PROCESSING_MODE === "worker" ? "worker" : "mock";
  const workerConfigured = Boolean(process.env.AI_WORKER_URL);
  const mongoConfigured = hasMongoConfig();

  return NextResponse.json({
    aiProcessingMode,
    workerConfigured,
    mongoConfigured,
    publicLimitations: [
      "Mock AI is the default in public alpha.",
      "Real video bytes are not uploaded yet.",
      "Worker mode is scaffolded only.",
      "Authorized footage is required for any real pilot.",
      "No facial recognition.",
      "No automatic challan.",
      "Human review required.",
    ],
  });
}
