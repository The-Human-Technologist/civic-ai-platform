import { existsSync, readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, relative, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const requiredPaths = [
  "src/lib/processing/types.ts",
  "src/lib/processing/client.ts",
  "src/lib/processing/worker-client.ts",
  "src/lib/processing/validation.ts",
  "src/lib/processing/state.ts",
  "src/lib/processing/to-review-events.ts",
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
  "src/app/api/processing/video/route.ts",
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
  "services/ai-worker/tests/test_worker_safety.py",
  "services/ai-worker/scripts/bootstrap_model.py",
  "services/ai-worker/scripts/doctor.py",
  "docs/real-pilot-requirements.md",
  "docs/authorized-footage-intake.md",
];

const missing = requiredPaths.filter((relativePath) => !existsSync(resolve(root, relativePath)));
if (missing.length > 0) {
  console.error("Missing Phase 2A foundation files:");
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

function read(relativePath) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

const envExample = read(".env.example");
for (const requiredEnv of [
  "AI_PROCESSING_MODE",
  "MONGODB_URI",
  "AUTHORIZED_UPLOADS_ENABLED",
  "ALLOW_DEV_JOB_MUTATIONS",
  "YOLO_MODEL_PATH",
  "PRIVACY_MASKING_ENABLED",
]) {
  if (!envExample.includes(requiredEnv)) {
    console.error(`.env.example is missing ${requiredEnv}`);
    process.exit(1);
  }
}

const uploadClient = read("src/app/dashboard/upload/upload-client.tsx");
for (const requiredHook of [
  "createProcessingJob",
  "processAuthorizedVideo",
  "processingDetectionsToReviewEvents",
]) {
  if (!uploadClient.includes(requiredHook)) {
    console.error(`Upload page does not reference ${requiredHook}`);
    process.exit(1);
  }
}

const pilotDoc = read("docs/real-pilot-requirements.md");
for (const milestone of [
  "Phase 2A.1 processing job API",
  "Phase 2A.2 worker connector",
  "Phase 2A.3 authorized footage intake/storage scaffold",
  "Phase 2A.4 safety and review hardening",
]) {
  if (!pilotDoc.includes(milestone)) {
    console.error(`docs/real-pilot-requirements.md is missing ${milestone}`);
    process.exit(1);
  }
}

const workerMain = read("services/ai-worker/main.py");
for (const endpoint of ['"/health"', '"/process-sample-job"', '"/process-video"']) {
  if (!workerMain.includes(endpoint)) {
    console.error(`services/ai-worker/main.py is missing ${endpoint}`);
    process.exit(1);
  }
}

function listFallbackFiles(directory) {
  const excluded = new Set([".git", ".next", ".vercel", "node_modules", ".venv", "venv"]);
  const output = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) output.push(...listFallbackFiles(absolute));
    else output.push(relative(root, absolute).replaceAll("\\", "/"));
  }
  return output;
}

let trackedFiles;
try {
  trackedFiles = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" }).split(/\r?\n/);
} catch {
  console.warn("Warning: git process unavailable; using a conservative filesystem policy scan.");
  trackedFiles = listFallbackFiles(root);
}

const forbiddenPattern = /\.(mp4|mov|webm|avi|mkv|zip|tar|tar\.gz|pt|onnx|engine)$/i;
const forbiddenDirectoryPattern = /^(data|datasets|videos)\//i;
const dataAllowlist = new Set(["data/readme.local.md", "data/sources.example.json"]);
const forbidden = trackedFiles.filter(
  (file) =>
    file &&
    !dataAllowlist.has(file.toLowerCase()) &&
    (forbiddenPattern.test(file) || forbiddenDirectoryPattern.test(file)),
);

if (forbidden.length > 0) {
  console.error("Forbidden tracked files detected:");
  for (const file of forbidden) console.error(`- ${file}`);
  process.exit(1);
}

const videoRoute = read("src/app/api/processing/video/route.ts");
for (const safeguard of [
  "authorizationConfirmed",
  "authorizationReference",
  "ALLOWED_TYPES",
  "MAX_VIDEO_UPLOAD_MB",
]) {
  if (!videoRoute.includes(safeguard)) {
    console.error(`Authorized-video route is missing ${safeguard}`);
    process.exit(1);
  }
}

const detector = read("services/ai-worker/app/detectors.py");
for (const capability of [
  "YoloCivicDetector",
  "PRIVACY_SENSITIVE_OBJECTS",
  "humanReviewStatus=\"pending\"",
  "mask_object_regions",
]) {
  if (!detector.includes(capability)) {
    console.error(`Real detector is missing ${capability}`);
    process.exit(1);
  }
}

console.log("Phase 2 real-inference and safety contract verified.");
