import { NextResponse } from "next/server";
import {
  callWorkerHealth,
  isWorkerConfigured,
  isWorkerModeEnabled,
} from "@/lib/processing/worker-client";

export async function GET() {
  const workerModeEnabled = isWorkerModeEnabled();
  const workerConfigured = isWorkerConfigured();

  if (!workerModeEnabled) {
    return NextResponse.json({
      workerModeEnabled,
      workerConfigured,
      online: false,
      error: workerConfigured
        ? "Worker URL is configured, but AI_PROCESSING_MODE is not set to worker."
        : "Worker mode is not enabled.",
    });
  }

  const result = await callWorkerHealth();
  if (!result.ok) {
    return NextResponse.json({
      workerModeEnabled,
      workerConfigured,
      online: false,
      error: result.error,
    });
  }

  return NextResponse.json({
    workerModeEnabled,
    workerConfigured,
    online: true,
    health: result.data,
  });
}
