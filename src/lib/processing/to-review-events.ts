import { LOCATIONS } from "@/lib/data/locations";
import type { ProcessingDetection, ProcessingJob } from "@/lib/processing/types";
import type { DetectionEvent, EventType, Location } from "@/types";

const DESCRIPTION_BY_TYPE: Record<EventType, string> = {
  illegal_parking: "Potential illegal parking event flagged for human review.",
  wrong_way_driving: "Potential wrong-way movement flagged for human review.",
  helmet_violation: "Potential helmet advisory event flagged for human review.",
  overspeeding_estimate: "Advisory speed estimate flagged for human review; not legal evidence.",
  accident_near_miss: "Potential accident or near-miss flagged for human review.",
  pothole: "Potential road-surface defect flagged for field verification.",
  garbage_overflow: "Potential waste overflow flagged for sanitation review.",
  waterlogging: "Potential standing-water event flagged for drainage review.",
  road_blockage: "Potential road obstruction flagged for human review.",
  crowd_congestion: "Potential congestion event flagged for traffic review.",
};

const ACTION_BY_TYPE: Record<EventType, string> = {
  illegal_parking: "Confirm the location and obstruction before routing to traffic staff.",
  wrong_way_driving: "Review the evidence clip and verify direction of travel.",
  helmet_violation: "Review manually; do not issue any automatic penalty.",
  overspeeding_estimate: "Treat as advisory only unless approved calibrated equipment is used.",
  accident_near_miss: "Verify immediately and escalate only if the event is confirmed.",
  pothole: "Request a geo-tagged field inspection before repair dispatch.",
  garbage_overflow: "Verify current conditions and route to sanitation if confirmed.",
  waterlogging: "Request drainage field verification and record the response.",
  road_blockage: "Verify the obstruction and notify the responsible field team.",
  crowd_congestion: "Review traffic conditions and consider a field check.",
};

function toEventType(type: ProcessingDetection["type"]): EventType | null {
  if (type === "congestion") return "crowd_congestion";
  if (type === "unknown") return null;
  return type;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "processing_location";
}

function resolveLocation(label: string): Location {
  const known = Object.values(LOCATIONS).find(
    (location) => location.name.toLowerCase() === label.toLowerCase(),
  );
  if (known) return known;

  return {
    id: slugify(label),
    name: label,
    area: "Barasat pilot area — location supplied by processing job",
    lat: 22.7219,
    lng: 88.4812,
  };
}

export function processingDetectionsToReviewEvents(
  job: ProcessingJob,
  detections: ProcessingDetection[],
): DetectionEvent[] {
  return detections.flatMap((detection) => {
    const type = toEventType(detection.type);
    if (!type) return [];

    return [{
      id: `job-${job.id}-${detection.id}`,
      type,
      location: resolveLocation(detection.locationLabel),
      timestamp: job.updatedAt,
      confidence: detection.confidence,
      severity: detection.severity,
      status: detection.humanReviewStatus,
      description: DESCRIPTION_BY_TYPE[type],
      recommendedAction: ACTION_BY_TYPE[type],
      evidenceLabel: `Processing job ${job.id.slice(0, 8)} · synthetic/authorized metadata`,
      source: "processing_job",
      processingJobId: job.id,
      frameTimestampSec: detection.frameTimestampSec,
      privacyMasked: detection.privacyMasked,
    } satisfies DetectionEvent];
  });
}
