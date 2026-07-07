import { UploadPageClient } from "./upload-client";

export default function UploadPage() {
  const workerModeEnabled =
    process.env.AI_PROCESSING_MODE === "worker" && Boolean(process.env.AI_WORKER_URL);

  return <UploadPageClient workerModeEnabled={workerModeEnabled} />;
}
