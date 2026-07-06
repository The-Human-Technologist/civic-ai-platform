#!/usr/bin/env node
/**
 * Verify no forbidden footage, datasets, or model weights are committed.
 * Uses `git ls-files` so local gitignored `data/` scaffolds do not fail the check.
 * Run: npm run verify:footage
 */
const { execSync } = require("node:child_process");
const path = require("node:path");

const FORBIDDEN_EXTENSIONS = new Set([
  ".mp4",
  ".mov",
  ".avi",
  ".mkv",
  ".webm",
  ".zip",
  ".tar",
  ".gz",
  ".pt",
  ".onnx",
  ".engine",
]);

const ROOT_FORBIDDEN_PREFIXES = ["data/", "datasets/", "videos/"];

/** Allowed tracked scaffold under root data/ (from prepare:data) */
const DATA_SCAFFOLD_ALLOWLIST = new Set([
  "data/readme.local.md",
  "data/sources.example.json",
]);

const PLACEHOLDER_ALLOWLIST = new Set([
  "public/demo-placeholders/readme.md",
  "public/demo-placeholders/.gitkeep",
]);

function getTrackedFiles() {
  try {
    const out = execSync("git ls-files", { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
    return out
      .split(/\r?\n/)
      .map((line) => line.replace(/\\/g, "/").trim())
      .filter(Boolean);
  } catch {
    return null;
  }
}

function isForbiddenFile(relPath) {
  const normalized = relPath.replace(/\\/g, "/").toLowerCase();

  if (PLACEHOLDER_ALLOWLIST.has(normalized)) {
    return false;
  }

  if (DATA_SCAFFOLD_ALLOWLIST.has(normalized)) {
    return false;
  }

  const base = path.basename(normalized);
  if (base.endsWith(".tar.gz")) {
    return true;
  }

  const ext = path.extname(base);
  if (FORBIDDEN_EXTENSIONS.has(ext)) {
    return true;
  }

  for (const prefix of ROOT_FORBIDDEN_PREFIXES) {
    if (normalized.startsWith(prefix) && !DATA_SCAFFOLD_ALLOWLIST.has(normalized)) {
      return true;
    }
  }

  return false;
}

function main() {
  const tracked = getTrackedFiles();

  if (tracked === null) {
    console.warn("Warning: git not available — skipping footage policy scan.");
    process.exit(0);
  }

  const violations = tracked.filter(isForbiddenFile).sort();

  if (violations.length > 0) {
    console.error("Footage policy violations — forbidden files or directories found:\n");
    for (const v of violations) {
      console.error(`  - ${v}`);
    }
    console.error("\nRemove these files or add to .gitignore. Never commit raw CCTV or datasets.");
    process.exit(1);
  }

  console.log(
    "Footage policy verified: no raw videos, datasets, or model weights committed.",
  );
}

main();
