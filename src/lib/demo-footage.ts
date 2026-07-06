import type { EventType } from "@/types";

export type DemoFootageType =
  | "stock_clip"
  | "public_dataset"
  | "synthetic_placeholder"
  | "authorized_pilot_placeholder";

export type LicenseStatus =
  | "verified"
  | "manual_verification_required"
  | "not_for_redistribution"
  | "requires_permission";

export type DemoFootage = {
  id: string;
  title: string;
  type: DemoFootageType;
  locationLabel: string;
  useCase: string;
  description: string;
  sourceName: string;
  sourceUrl?: string;
  licenseStatus: LicenseStatus;
  licenseNote: string;
  privacyRisk: "low" | "medium" | "high";
  allowedUse: string[];
  notAllowed: string[];
  suggestedDetections: string[];
  /** Mock processor only — maps synthetic demo cards to event types */
  mockEventTypes?: EventType[];
};

export const DEMO_FOOTAGE_TYPE_LABELS: Record<DemoFootageType, string> = {
  stock_clip: "Stock clip candidate",
  public_dataset: "Public dataset candidate",
  synthetic_placeholder: "Synthetic placeholder",
  authorized_pilot_placeholder: "Authorized pilot placeholder",
};

export const LICENSE_STATUS_LABELS: Record<LicenseStatus, string> = {
  verified: "Verified",
  manual_verification_required: "Manual verification required",
  not_for_redistribution: "Not for redistribution in repo",
  requires_permission: "Requires written permission",
};

/** IDs for upload page “Try with demo footage” cards — synthetic only */
export const SYNTHETIC_UPLOAD_DEMO_IDS = [
  "synthetic-barasat-junction",
  "synthetic-monsoon-waterlogging",
  "synthetic-garbage-overflow",
] as const;

export const demoFootageLibrary: DemoFootage[] = [
  {
    id: "synthetic-barasat-junction",
    title: "Synthetic Barasat Junction Demo",
    type: "synthetic_placeholder",
    locationLabel: "Colony More Junction · Barasat (sample)",
    useCase: "Junction congestion, wrong-way advisory, parking patterns",
    description:
      "In-app synthetic scenario — no video file. Simulates human-reviewed alerts for a busy market junction.",
    sourceName: "Civic AI Platform (generated mock)",
    licenseStatus: "verified",
    licenseNote: "Project-generated placeholder — no real CCTV.",
    privacyRisk: "low",
    allowedUse: [
      "Live public demo",
      "Grant walkthroughs",
      "Upload page mock detection flow",
    ],
    notAllowed: [
      "Claiming as real municipal CCTV",
      "Redistributing as real footage",
    ],
    suggestedDetections: [
      "Illegal parking",
      "Traffic congestion",
      "Wrong-way driving (advisory)",
    ],
    mockEventTypes: [
      "illegal_parking",
      "crowd_congestion",
      "wrong_way_driving",
    ],
  },
  {
    id: "synthetic-monsoon-waterlogging",
    title: "Synthetic Monsoon Waterlogging Demo",
    type: "synthetic_placeholder",
    locationLabel: "Nabapally / Hridaypur corridor (sample)",
    useCase: "Standing water, drainage failure hotspots during monsoon",
    description:
      "Synthetic civic maintenance scenario — no real flood footage bundled.",
    sourceName: "Civic AI Platform (generated mock)",
    licenseStatus: "verified",
    licenseNote: "Mock metadata only — not trained on local CCTV.",
    privacyRisk: "low",
    allowedUse: ["Dashboard demos", "PWD / drainage department pitch"],
    notAllowed: ["Real disaster footage without license", "Git commit of raw video"],
    suggestedDetections: ["Waterlogging", "Road blockage", "Pothole (adjacent damage)"],
    mockEventTypes: ["waterlogging", "road_blockage", "pothole"],
  },
  {
    id: "synthetic-garbage-overflow",
    title: "Synthetic Garbage Overflow Demo",
    type: "synthetic_placeholder",
    locationLabel: "Champadali market edge (sample)",
    useCase: "Solid waste overflow near markets and drains",
    description:
      "Synthetic sanitation scenario for municipal solid-waste team workflows.",
    sourceName: "Civic AI Platform (generated mock)",
    licenseStatus: "verified",
    licenseNote: "No real street imagery included.",
    privacyRisk: "low",
    allowedUse: ["Sanitation module UX demo", "Human review training"],
    notAllowed: ["Identifiable vendors/residents in public assets"],
    suggestedDetections: ["Garbage overflow", "Illegal parking (blocking collection)"],
    mockEventTypes: ["garbage_overflow", "illegal_parking"],
  },
  {
    id: "stock-traffic-candidate",
    title: "Stock Traffic Clip Candidate",
    type: "stock_clip",
    locationLabel: "Generic urban road (external)",
    useCase: "Marketing clips, UI backgrounds, grant b-roll (external host only)",
    description:
      "Placeholder entry for a licensed stock clip — link and license must be verified before any use.",
    sourceName: "Stock provider (Pexels, Pixabay, etc.) — TBD",
    licenseStatus: "manual_verification_required",
    licenseNote:
      "Per-clip license check required. Do not commit MP4 to this repository.",
    privacyRisk: "medium",
    allowedUse: [
      "External embed or cloud URL with documented license",
      "Screenshots after masking plates/faces if needed",
    ],
    notAllowed: [
      "Bundling clip in GitHub",
      "Random CCTV scrapes",
      "Use without license documentation",
    ],
    suggestedDetections: ["Congestion", "Parking", "Near-miss (advisory)"],
  },
  {
    id: "bdd100k-candidate",
    title: "BDD100K External Dataset Candidate",
    type: "public_dataset",
    locationLabel: "US driving scenes (dataset)",
    useCase: "Road scene understanding baseline for Phase 2 CV",
    description:
      "Berkeley BDD100K — register and download manually; store under local data/raw only.",
    sourceName: "Berkeley DeepDrive (BDD100K)",
    sourceUrl: "https://bdd-data.berkeley.edu/",
    licenseStatus: "manual_verification_required",
    licenseNote: "BDD100K terms apply — not for redistribution in this repo.",
    privacyRisk: "medium",
    allowedUse: ["Offline model training/evaluation", "Local dev outside Git"],
    notAllowed: [
      "Committing dataset to GitHub",
      "Claiming as Kolkata/Barasat CCTV",
    ],
    suggestedDetections: [
      "Vehicles",
      "Lane context",
      "Weather diversity (research)",
    ],
  },
  {
    id: "aicity-candidate",
    title: "AI City Challenge External Dataset Candidate",
    type: "public_dataset",
    locationLabel: "Challenge benchmark cities (dataset)",
    useCase: "Multi-camera traffic tracking research",
    description:
      "AI City Challenge releases — download per official challenge rules only.",
    sourceName: "AI City Challenge",
    sourceUrl: "https://www.aicitychallenge.org/",
    licenseStatus: "manual_verification_required",
    licenseNote: "Challenge-specific terms — manual verification required each year.",
    privacyRisk: "medium",
    allowedUse: ["Tracking experiments in Phase 2", "Local data/raw storage"],
    notAllowed: ["Repo bundling", "Violation of challenge redistribution rules"],
    suggestedDetections: ["Vehicle tracks", "Junction counts", "Congestion proxies"],
  },
  {
    id: "bmd45-style-candidate",
    title: "BMD-45-style CCTV Traffic Dataset Candidate",
    type: "public_dataset",
    locationLabel: "Developing-city traffic (academic release)",
    useCase: "Dense urban vehicle detection research",
    description:
      "Academic CCTV-style traffic datasets — verify exact paper/license before download.",
    sourceName: "BMD-45-style release (verify official source)",
    licenseStatus: "manual_verification_required",
    licenseNote:
      "Manual source verification required — do not assume Kolkata/Barasat origin.",
    privacyRisk: "high",
    allowedUse: ["Offline research with masking policy", "Local storage only"],
    notAllowed: [
      "Public demo without masking",
      "Scraped municipal streams",
      "Git commit of raw video",
    ],
    suggestedDetections: ["Vehicle detection", "Congestion", "Near-miss heuristics"],
  },
  {
    id: "authorized-municipal-placeholder",
    title: "Authorized Municipal Pilot Placeholder",
    type: "authorized_pilot_placeholder",
    locationLabel: "One road + one junction (pilot scope)",
    useCase: "Real 30-day municipality pilot validation",
    description:
      "Reserved slot for officially authorized footage — not available in public alpha.",
    sourceName: "Municipality / traffic department (written agreement)",
    licenseStatus: "requires_permission",
    licenseNote:
      "Pilot MOU required: bounded scope, human review only, no public raw release, mask on ingest.",
    privacyRisk: "high",
    allowedUse: [
      "Private pilot environment",
      "Masked evidence clips for official review",
    ],
    notAllowed: [
      "Open CCTV scraping",
      "GitHub upload of raw CCTV",
      "Automatic enforcement / challans",
      "Public redistribution",
    ],
    suggestedDetections: [
      "Civic maintenance",
      "Advisory road safety",
      "Human-confirmed events only",
    ],
  },
];

export function getDemoFootageById(id: string): DemoFootage | undefined {
  return demoFootageLibrary.find((entry) => entry.id === id);
}

export function getSyntheticUploadDemos(): DemoFootage[] {
  return SYNTHETIC_UPLOAD_DEMO_IDS.map(
    (id) => demoFootageLibrary.find((e) => e.id === id)!,
  );
}
