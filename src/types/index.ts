export const EVENT_TYPES = [
  "illegal_parking",
  "wrong_way_driving",
  "helmet_violation",
  "overspeeding_estimate",
  "accident_near_miss",
  "pothole",
  "garbage_overflow",
  "waterlogging",
  "road_blockage",
  "crowd_congestion",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const SEVERITIES = ["low", "medium", "high", "critical"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const REVIEW_STATUSES = [
  "pending",
  "confirmed",
  "rejected",
  "needs_field_verification",
] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export interface Location {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
}

export interface CameraFeed {
  id: string;
  name: string;
  location: Location;
  status: "online" | "offline" | "demo";
  description: string;
  thumbnailLabel: string;
}

export interface DetectionEvent {
  id: string;
  type: EventType;
  location: Location;
  timestamp: string;
  confidence: number;
  severity: Severity;
  status: ReviewStatus;
  description: string;
  recommendedAction: string;
  cameraFeedId?: string;
  evidenceLabel?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface PilotReport {
  title: string;
  period: string;
  summary: string;
  totalEvents: number;
  topProblemAreas: { location: string; count: number; primaryIssue: string }[];
  eventBreakdown: { type: EventType; count: number }[];
  suggestedInterventions: string[];
  privacySafeguards: string[];
  reviewStats: {
    pending: number;
    confirmed: number;
    rejected: number;
    needsFieldVerification: number;
  };
}

export interface DashboardStats {
  eventsToday: number;
  pendingReview: number;
  confirmed: number;
  rejected: number;
  highRiskLocations: number;
  avgCongestionScore: number;
  helmetViolations: number;
  illegalParking: number;
  potholes: number;
  waterloggingAlerts: number;
}

export interface Hotspot {
  id: string;
  label: string;
  category: "parking" | "accident" | "pothole" | "waterlogging" | "congestion";
  location: Location;
  intensity: number;
  eventCount: number;
  description: string;
}

export interface PrivacySettings {
  faceBlurringPlanned: boolean;
  numberPlateMasking: boolean;
  dataRetentionDays: number;
  roleBasedAccessPlanned: boolean;
  auditLogsEnabled: boolean;
  humanReviewRequired: boolean;
  facialRecognitionDisabled: boolean;
}

export type ProcessingStage =
  | "idle"
  | "uploading"
  | "processing"
  | "complete"
  | "error";
