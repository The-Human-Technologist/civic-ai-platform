#!/usr/bin/env node
/**
 * Scaffold local data folders (gitignored). Does NOT download any datasets.
 * Run: npm run prepare:data
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const dataRoot = join(root, "data");

const folders = [
  "raw",
  "processed",
  "samples",
  "annotations",
  "exports",
];

const readmeLocal = `# Local data (gitignored)

This folder is **not** committed to Git. Store manual dataset downloads here only.

## Rules

1. Download datasets manually from **official sources** listed in DATA_SOURCES.md
2. **Do not commit** raw video to GitHub
3. **Blur faces** and **mask number plates** before public demo use
4. Copy \`sources.example.json\` → \`sources.json\` and document each dataset
5. Never scrape random open CCTV streams

## Structure

- \`raw/\` — original downloads from licensed sources
- \`processed/\` — resized clips, extracted frames
- \`samples/\` — small dev clips (still keep out of Git commits)
- \`annotations/\` — labels and exports
- \`exports/\` — masked evidence clips for review workflows

See docs/data/README.md and DATA_SOURCES.md in the project root.
`;

const sourcesExample = {
  $schema: "civic-ai-platform/local-dataset-manifest-v1",
  updatedAt: new Date().toISOString().slice(0, 10),
  datasets: [
    {
      id: "bdd100k",
      name: "BDD100K",
      localPath: "data/raw/bdd100k",
      downloadedAt: null,
      license: "BDD100K — verify at https://bdd-data.berkeley.edu/",
      status: "not_downloaded",
      notes: "Phase 2 road scene baseline — not for redistribution",
    },
    {
      id: "synthetic-demo",
      name: "In-app synthetic demo",
      localPath: null,
      downloadedAt: null,
      license: "Project mock data only",
      status: "available_for_demo",
      notes: "Default public alpha — no local files required",
    },
  ],
};

async function main() {
  await mkdir(dataRoot, { recursive: true });

  for (const dir of folders) {
    await mkdir(join(dataRoot, dir), { recursive: true });
  }

  await writeFile(join(dataRoot, "README.local.md"), readmeLocal, "utf8");
  await writeFile(
    join(dataRoot, "sources.example.json"),
    JSON.stringify(sourcesExample, null, 2) + "\n",
    "utf8",
  );

  console.log("");
  console.log("Civic AI Platform — local data scaffold");
  console.log("======================================");
  console.log("");
  console.log("Created (gitignored):");
  for (const dir of folders) {
    console.log(`  data/${dir}/`);
  }
  console.log("  data/README.local.md");
  console.log("  data/sources.example.json");
  console.log("");
  console.log("Next steps:");
  console.log("  1. Read DATA_SOURCES.md and docs/data/README.md");
  console.log("  2. Download datasets manually from official sources only");
  console.log("  3. Do not commit raw video (*.mp4, *.mov, etc.)");
  console.log("  4. Blur faces and mask plates before public demo use");
  console.log("  5. Copy sources.example.json → sources.json and fill in metadata");
  console.log("");
  console.log("MVP uses mock detections — no local data required to run the app.");
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
