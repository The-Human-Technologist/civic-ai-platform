import type { EventType } from "@/types";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  illegal_parking: "Illegal Parking",
  wrong_way_driving: "Wrong-Way Driving",
  helmet_violation: "Helmet Non-Compliance",
  overspeeding_estimate: "Speed Estimation (Advisory)",
  accident_near_miss: "Accident / Near-Miss",
  pothole: "Pothole / Road Damage",
  garbage_overflow: "Solid Waste Overflow",
  waterlogging: "Waterlogging",
  road_blockage: "Road Blockage",
  crowd_congestion: "Traffic Congestion",
};

export const SEVERITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
} as const;

export const STATUS_LABELS = {
  pending: "Pending Review",
  confirmed: "Confirmed",
  rejected: "Rejected",
  needs_field_verification: "Field Verification Required",
} as const;

export const PLATFORM_NAME =
  "AI Civic & Road Safety Intelligence Platform";

export const PLATFORM_TAGLINE =
  "Human-reviewed civic analytics from existing CCTV and video footage — Barasat pilot";

export const PILOT_TITLE =
  "30-Day AI Civic & Road Safety Analytics Pilot";

export const PILOT_SUBTITLE =
  "Barasat Municipality · North 24 Parganas · Government of West Bengal";

export const PILOT_CORRIDOR =
  "Colony More Junction & Barasat Station Road corridor";

export const DISCLAIMER =
  "This platform assists official human review only. No automatic fine, challan, prosecution, or legal action is generated. All detections require confirmation by designated municipal or traffic authorities before any field response.";

export const GOV_FOOTER =
  "Prepared for demonstration to Barasat Municipality, District Traffic Police, Transport Department, and IT/WEBEL stakeholders.";

/** Shown in UI and referenced in open-source docs */
export const MVP_LIMITATIONS = [
  "This MVP does not issue automatic fines or challans.",
  "This MVP does not perform facial recognition.",
  "This MVP does not claim legal-grade speed enforcement.",
  "All detections are mock/demo outputs for human-review workflow demonstration.",
  "Real deployments must follow local laws, procurement rules, privacy rules, and official authorization.",
] as const;

export const DEMO_DATA_NOTICE =
  "All sample locations, events, camera feeds, and statistics in this repository are synthetic demo data. No real individuals, vehicles, or enforcement actions are represented.";
