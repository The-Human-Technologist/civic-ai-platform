export type DataSourceKind =
  | "public_dataset"
  | "stock_footage"
  | "synthetic"
  | "self_recorded"
  | "authorized_pilot";

export type DataSourceStatus =
  | "available_for_demo"
  | "manual_download_required"
  | "planned"
  | "requires_permission"
  | "not_in_repo";

export type DataSource = {
  id: string;
  name: string;
  kind: DataSourceKind;
  purpose: string;
  dataType: string;
  licenseNote: string;
  status: DataSourceStatus;
  privacyRisk: "low" | "medium" | "high";
  recommendedUse: string;
  notAllowed?: string[];
  url?: string;
};

export const DATA_SOURCE_KIND_LABELS: Record<DataSourceKind, string> = {
  public_dataset: "Public research dataset",
  stock_footage: "Stock footage (external)",
  synthetic: "Synthetic / demo",
  self_recorded: "Self-recorded (masked)",
  authorized_pilot: "Authorized pilot footage",
};

export const DATA_SOURCE_STATUS_LABELS: Record<DataSourceStatus, string> = {
  available_for_demo: "Available for demo",
  manual_download_required: "Manual download required",
  planned: "Planned",
  requires_permission: "Requires written permission",
  not_in_repo: "Not in repository",
};

export const dataSources: DataSource[] = [
  {
    id: "bdd100k",
    name: "BDD100K",
    kind: "public_dataset",
    purpose: "Road scene understanding, vehicles, weather diversity",
    dataType: "Driving video + segmentation/detection labels",
    licenseNote:
      "Berkeley BDD100K license — register and download from official site only.",
    status: "manual_download_required",
    privacyRisk: "medium",
    recommendedUse: "Phase 2 model training and offline evaluation — not bundled in repo",
    url: "https://bdd-data.berkeley.edu/",
  },
  {
    id: "bmd45-style",
    name: "BMD-45-style developing-city traffic CCTV",
    kind: "public_dataset",
    purpose: "Vehicle detection in dense developing-city traffic scenes",
    dataType: "CCTV-style traffic video (external academic releases)",
    licenseNote:
      "Manual source verification required — confirm paper/dataset license before download. Not Kolkata/Barasat CCTV.",
    status: "manual_download_required",
    privacyRisk: "high",
    recommendedUse: "Offline research only; blur/mask before any demo clip",
    notAllowed: ["Claiming as local municipal CCTV", "Committing raw clips to Git"],
  },
  {
    id: "aicity",
    name: "AI City Challenge (traffic tracking)",
    kind: "public_dataset",
    purpose: "Multi-camera traffic tracking and junction analytics",
    dataType: "Benchmark traffic videos per challenge year",
    licenseNote: "AI City Challenge terms — use only per official challenge rules.",
    status: "manual_download_required",
    privacyRisk: "medium",
    recommendedUse: "Tracking experiments in Phase 2 — download outside repo",
    url: "https://www.aicitychallenge.org/",
  },
  {
    id: "stock-traffic",
    name: "Licensed stock traffic clips",
    kind: "stock_footage",
    purpose: "UI walkthroughs, marketing, grant screenshots",
    dataType: "Short hosted clips (Pexels, Pixabay, etc.)",
    licenseNote:
      "Per-clip license check required — link externally; do not redistribute in Git unless license allows.",
    status: "not_in_repo",
    privacyRisk: "medium",
    recommendedUse: "External URLs or cloud storage with documented license",
    notAllowed: ["Random CCTV scrapes", "Clips with identifiable plates in public README"],
  },
  {
    id: "synthetic-demo",
    name: "Synthetic civic demo footage",
    kind: "synthetic",
    purpose: "Safe public-alpha demos without real-world identifiers",
    dataType: "Mock feeds, placeholders, generated illustrations",
    licenseNote: "Project-generated — no real CCTV.",
    status: "available_for_demo",
    privacyRisk: "low",
    recommendedUse: "Default for live demo and GitHub — see demo feed cards in app",
  },
  {
    id: "authorized-municipal",
    name: "Authorized municipal / traffic pilot footage",
    kind: "authorized_pilot",
    purpose: "Real pilot validation with human-reviewed workflow",
    dataType: "Restricted CCTV or uploaded pilot video",
    licenseNote:
      "Written pilot agreement required — one road, one junction, bounded period, no public raw release.",
    status: "requires_permission",
    privacyRisk: "high",
    recommendedUse: "Phase 6 municipality pilot — store outside Git; mask on ingest",
    notAllowed: [
      "Open CCTV scraping",
      "Automatic enforcement",
      "Public GitHub upload of raw footage",
    ],
  },
  {
    id: "pothole-rdd",
    name: "Pothole / road-damage public datasets",
    kind: "public_dataset",
    purpose: "Civic maintenance — surface defect detection",
    dataType: "Road images/video (RDD, Pothole-600-style releases)",
    licenseNote:
      "Manual source verification required — each dataset has its own terms (e.g. RDD, public road-damage collections).",
    status: "planned",
    privacyRisk: "low",
    recommendedUse: "Phase 2 pothole class — download to data/raw only",
  },
  {
    id: "waste-detection",
    name: "Garbage / waste detection public datasets",
    kind: "public_dataset",
    purpose: "Solid waste overflow and street cleanliness signals",
    dataType: "Street scene images (TACO, TrashNet-style)",
    licenseNote:
      "Manual source verification required — confirm license per dataset before use.",
    status: "planned",
    privacyRisk: "medium",
    recommendedUse: "Sanitation module research — keep outside repo",
  },
  {
    id: "flood-waterlogging",
    name: "Waterlogging / flooded-road datasets",
    kind: "public_dataset",
    purpose: "Standing water and monsoon drainage hotspot detection",
    dataType: "Flood/street water images and video",
    licenseNote:
      "Manual source verification required — academic flood datasets vary by license.",
    status: "planned",
    privacyRisk: "low",
    recommendedUse: "Drainage analytics R&D — no claim of local CCTV training",
  },
  {
    id: "accident-nearmiss",
    name: "Traffic accident / near-miss datasets",
    kind: "public_dataset",
    purpose: "Advisory safety analytics — not legal evidence",
    dataType: "Dashcam or traffic incident video (licensed releases)",
    licenseNote:
      "Manual source verification required — use only for advisory patterns; not prosecution.",
    status: "planned",
    privacyRisk: "high",
    recommendedUse: "Near-miss heuristics in Phase 2 — strict masking policy",
    notAllowed: ["Automatic challan integration", "Legal-grade speed prosecution"],
  },
  {
    id: "self-recorded",
    name: "Self-recorded road footage",
    kind: "self_recorded",
    purpose: "Controlled captures for local testing",
    dataType: "Your own phone/dashcam video",
    licenseNote: "You must blur faces and mask plates before demo or storage.",
    status: "not_in_repo",
    privacyRisk: "high",
    recommendedUse: "Local data/samples only — never commit to Git",
    notAllowed: ["Filming without consent where illegal", "Publishing identifiable plates"],
  },
];

export const ALLOWED_SOURCE_SUMMARY = [
  "Public research datasets with clear license/terms",
  "Stock traffic clips with verified reuse permission (external links)",
  "Synthetic and in-app demo footage",
  "Self-recorded video after face/plate masking (local only)",
  "Officially authorized municipal pilot footage (written agreement)",
] as const;

export const NOT_ALLOWED_SOURCE_SUMMARY = [
  "Random open CCTV streams without camera-owner permission",
  "Scraped live camera feeds",
  "Real CCTV or large video files committed to GitHub",
  "School, hospital, or private-space footage without authorization",
  "Identifiable faces or plates in public demo material",
  "Any footage pipeline for automatic fines or challans",
  "Claims of training on real Kolkata/Barasat CCTV in v0.1",
] as const;

export const FOOTAGE_WORKFLOW_STEPS = [
  "Choose a licensed or authorized source from the registry",
  "Download manually to local data/raw (outside Git)",
  "Preprocess locally — sample frames, resize, validate license",
  "Blur faces and mask number plates before demo or export",
  "Run inference worker (Phase 2) — mock only in MVP",
  "Store metadata and minimal evidence clips for human review only",
] as const;

export const PILOT_FOOTAGE_REQUIREMENTS = [
  "Written authorization from camera owner / municipality",
  "Bounded scope: one road, one junction, limited period",
  "Human-review-only processing — no automatic enforcement",
  "No public release of raw footage",
  "Face and plate masking before storage or export",
  "Secure retention and deletion per pilot agreement",
] as const;

export const PRIVACY_CHECKLIST = [
  "No raw video in git commits (check .gitignore)",
  "sources.json documents license and download date locally",
  "Demo screenshots use synthetic data or masked clips",
  "README does not claim real local CCTV training",
  "Upload page uses mock AI only in public alpha",
] as const;
