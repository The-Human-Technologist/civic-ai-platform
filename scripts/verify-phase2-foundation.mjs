import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const requiredPaths = [
  "src/lib/processing/types.ts",
  "src/lib/processing/client.ts",
  "src/lib/processing/worker-client.ts",
  "src/lib/storage/types.ts",
  "src/lib/storage/config.ts",
  "src/lib/storage/storage-adapter.ts",
  "src/lib/db/mongodb.ts",
  "src/lib/db/processing-jobs.ts",
  "src/lib/db/authorized-footage.ts",
  "src/app/api/processing/jobs/route.ts",
  "src/app/api/processing/jobs/[id]/route.ts",
  "src/app/api/processing/config/route.ts",
  "src/app/api/processing/worker-health/route.ts",
  "src/app/api/authorized-footage/intakes/route.ts",
  "src/app/api/authorized-footage/intakes/[id]/route.ts",
  "src/app/api/authorized-footage/presign-upload/route.ts",
  "services/ai-worker/README.md",
  "services/ai-worker/main.py",
  "services/ai-worker/app/frame_extractor.py",
  "services/ai-worker/app/privacy_masker.py",
  "services/ai-worker/app/detectors.py",
  "services/ai-worker/app/schemas.py",
  "services/ai-worker/app/config.py",
  "docs/real-pilot-requirements.md",
  "docs/authorized-footage-intake.md",
];

const missing = requiredPaths.filter((relativePath) => !existsSync(resolve(root, relativePath)));
if (missing.length > 0) {
  console.error("Missing Phase 2A foundation files:");
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

const envExample = execSync("pwsh -NoProfile -Command \"Get-Content '.env.example'\"", {
  cwd: root,
  encoding: "utf8",
});

for (const requiredEnv of ["AI_PROCESSING_MODE", "MONGODB_URI", "AUTHORIZED_UPLOADS_ENABLED"]) {
  if (!envExample.includes(requiredEnv)) {
    console.error(`.env.example is missing ${requiredEnv}`);
    process.exit(1);
  }
}

const uploadClient = execSync(
  "pwsh -NoProfile -Command \"Get-Content 'src/app/dashboard/upload/upload-client.tsx'\"",
  {
    cwd: root,
    encoding: "utf8",
  },
);

if (!uploadClient.includes("createProcessingJob")) {
  console.error("Upload page does not reference processing jobs yet");
  process.exit(1);
}

const pilotDoc = execSync(
  "pwsh -NoProfile -Command \"Get-Content 'docs/real-pilot-requirements.md'\"",
  {
    cwd: root,
    encoding: "utf8",
  },
);

if (!pilotDoc.includes("Phase 2A.1 processing job API")) {
  console.error("docs/real-pilot-requirements.md is missing the Phase 2A.1 processing job API section");
  process.exit(1);
}

if (!pilotDoc.includes("Phase 2A.2 worker connector")) {
  console.error("docs/real-pilot-requirements.md is missing the Phase 2A.2 worker connector section");
  process.exit(1);
}

if (!pilotDoc.includes("Phase 2A.3 authorized footage intake/storage scaffold")) {
  console.error(
    "docs/real-pilot-requirements.md is missing the Phase 2A.3 authorized footage intake/storage scaffold section",
  );
  process.exit(1);
}

const workerMain = execSync(
  "pwsh -NoProfile -Command \"Get-Content 'services/ai-worker/main.py'\"",
  {
    cwd: root,
    encoding: "utf8",
  },
);

for (const endpoint of ['"/health"', '"/process-demo-job"', '"/process-video-job"']) {
  if (!workerMain.includes(endpoint)) {
    console.error(`services/ai-worker/main.py is missing ${endpoint}`);
    process.exit(1);
  }
}

const trackedFiles = execSync("git ls-files", { cwd: root, encoding: "utf8" }).split(/\r?\n/);
const forbiddenPattern =
  /\.(mp4|mov|webm|avi|mkv|zip|tar|tar\.gz|pt|onnx|engine)$/i;
const forbiddenDirectoryPattern = /^(data|datasets|videos)\//i;

const forbidden = trackedFiles.filter(
  (file) => file && (forbiddenPattern.test(file) || forbiddenDirectoryPattern.test(file)),
);

if (forbidden.length > 0) {
  console.error("Forbidden tracked files detected:");
  for (const file of forbidden) console.error(`- ${file}`);
  process.exit(1);
}

console.log("Phase 2A foundation verified.");
