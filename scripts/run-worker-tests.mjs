import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const workerRoot = join(process.cwd(), "services", "ai-worker");
const localPython =
  process.platform === "win32"
    ? join(workerRoot, ".venv", "Scripts", "python.exe")
    : join(workerRoot, ".venv", "bin", "python");
const python = existsSync(localPython)
  ? localPython
  : process.platform === "win32"
    ? "python"
    : "python3";

const result = spawnSync(
  python,
  ["-m", "unittest", "discover", "-s", "tests", "-p", "test_*.py"],
  {
    cwd: workerRoot,
    stdio: "inherit",
  },
);

if (result.error) {
  console.error(`Could not start worker tests with ${python}:`, result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
