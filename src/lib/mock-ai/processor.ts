/**
 * Mock AI detection pipeline for MVP demo.
 *
 * SYNTHETIC OUTPUT: All detections are fake/demo data for human-review workflow
 * demonstration. No real computer vision runs in AI_PROCESSING_MODE=mock.
 *
 * REAL AI INTEGRATION POINT:
 * Replace this module with a worker/service that:
 * - Accepts video uploads to object storage (S3/GCS)
 * - Runs YOLO / custom CV models on frames
 * - Optionally connects to RTSP CCTV streams
 * - Applies face blurring and plate masking before storage
 * - Writes DetectionEvent records to PostgreSQL via API
 */

import type {
  DetectionEvent,
  EventType,
  ReviewStatus,
  Severity,
} from "@/types";
import { LOCATIONS } from "@/lib/data/locations";

const EVENT_TEMPLATES: Record<
  EventType,
  { descriptions: string[]; actions: string[]; severities: Severity[] }
> = {
  illegal_parking: {
    descriptions: [
      "Auto-rickshaw and private car parked in no-parking zone along Barasat Station Road, narrowing approach to railway footbridge.",
      "Double-parking detected on Lichutala Lane during evening peak — buses unable to use designated bay.",
      "Unauthorized parking on footpath near Colony More vegetable market forcing pedestrians onto carriageway.",
      "Vehicle blocking half lane outside Barasat Bus Terminus during morning rush.",
    ],
    actions: [
      "Dispatch civic enforcement team for on-site verification and signage review.",
      "Notify traffic police outpost for manual warning and tow assessment.",
    ],
    severities: ["low", "medium", "high"],
  },
  wrong_way_driving: {
    descriptions: [
      "Motorcycle entered one-way stretch on Barrackpore–Barasat Road against flow at Colony More approach.",
      "Auto-rickshaw took wrong-side cut near Nabapally to avoid signal queue — advisory review recommended.",
      "Mini-truck wrong-way movement on Deganga Road service lane detected.",
    ],
    actions: [
      "Flag junction for wrong-way signage audit and barrier placement study.",
      "Share evidence clip with traffic unit for educational intervention (no auto-challan).",
    ],
    severities: ["medium", "high", "critical"],
  },
  helmet_violation: {
    descriptions: [
      "Rider and pillion both without helmet detected at school zone approach.",
      "Helmet not properly strapped — compliance advisory candidate.",
    ],
    actions: [
      "Add location to road safety awareness campaign targeting list.",
      "Recommend helmet checkpoint coordination with local traffic volunteers.",
    ],
    severities: ["medium", "high"],
  },
  overspeeding_estimate: {
    descriptions: [
      "Speed estimation ~52 km/h in 30 km/h school zone (non-enforcement estimate).",
      "Vehicle speed estimate exceeds advisory limit near pedestrian crossing.",
    ],
    actions: [
      "Review speed calming measures — rumble strips / signage visibility check.",
      "Schedule joint review with school authorities; no automated penalty.",
    ],
    severities: ["medium", "high"],
  },
  accident_near_miss: {
    descriptions: [
      "Near-miss between auto and cyclist at unmarked crossing — no collision.",
      "Sudden braking event detected; possible minor scrape — human verification advised.",
    ],
    actions: [
      "Priority field verification and ambulance standby assessment if confirmed.",
      "Escalate to district road safety cell for hotspot analysis.",
    ],
    severities: ["high", "critical"],
  },
  pothole: {
    descriptions: [
      "Road surface depression ~40cm wide detected after recent rains.",
      "Cluster of small potholes affecting bus lane near drain cover.",
    ],
    actions: [
      "Create PWD / municipality repair ticket with geo-tagged evidence.",
      "Schedule patch repair within 72-hour SLA for high-traffic corridor.",
    ],
    severities: ["low", "medium", "high"],
  },
  garbage_overflow: {
    descriptions: [
      "Municipal bin overflow with roadside dumping spreading to drain.",
      "Bulk waste pile near market entrance — collection schedule review needed.",
    ],
    actions: [
      "Notify solid waste management ward supervisor for pickup dispatch.",
      "Review collection frequency for high-density commercial stretch.",
    ],
    severities: ["low", "medium"],
  },
  waterlogging: {
    descriptions: [
      "Standing water across Station Road carriageway after monsoon shower — drain near Nabapally suspected blocked.",
      "Persistent waterlogging at Colony More subway affecting pedestrians and auto stand.",
      "Water accumulation on Hridaypur Main Road near open manhole — field verification priority.",
    ],
    actions: [
      "Coordinate drainage department inspection and pump deployment if critical.",
      "Map recurring flood point for monsoon preparedness plan.",
    ],
    severities: ["medium", "high", "critical"],
  },
  road_blockage: {
    descriptions: [
      "Fallen tree branch partially blocking lane near colony entry.",
      "Construction material dumped on road shoulder narrowing effective width.",
    ],
    actions: [
      "Dispatch rapid response team for clearance verification.",
      "Issue advisory to traffic police for manual diversion if confirmed.",
    ],
    severities: ["medium", "high", "critical"],
  },
  crowd_congestion: {
    descriptions: [
      "Congestion score elevated — average vehicle queue >12 minutes estimated.",
      "Pedestrian density high near station exit during evening peak.",
    ],
    actions: [
      "Suggest temporary one-way adjustment during peak window.",
      "Share congestion digest with smart city operations for signal timing review.",
    ],
    severities: ["low", "medium", "high"],
  },
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomConfidence(type: EventType): number {
  const base =
    type === "accident_near_miss" || type === "waterlogging" ? 0.72 : 0.65;
  return Math.min(0.97, base + Math.random() * 0.25);
}

function generateEventId(): string {
  const seq = Math.floor(1000 + Math.random() * 9000);
  return `EVT-BRS-${seq}`;
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function buildEvent(
  type: EventType,
  locationId: keyof typeof LOCATIONS,
  status: ReviewStatus,
  hoursBack: number,
  cameraFeedId?: string,
  overrides?: Partial<DetectionEvent>,
): DetectionEvent {
  const template = EVENT_TEMPLATES[type];
  return {
    id: overrides?.id ?? generateEventId(),
    type,
    location: LOCATIONS[locationId],
    timestamp: hoursAgo(hoursBack),
    confidence: overrides?.confidence ?? randomConfidence(type),
    severity: overrides?.severity ?? pick(template.severities),
    status,
    description: overrides?.description ?? pick(template.descriptions),
    recommendedAction: overrides?.recommendedAction ?? pick(template.actions),
    cameraFeedId,
    evidenceLabel: `Evidence clip — ${LOCATIONS[locationId].name}`,
    ...overrides,
  };
}

/** Seed dataset — fixed IDs for stable demo links; Barasat pilot corridor */
export function getSeedEvents(): DetectionEvent[] {
  return [
    buildEvent("illegal_parking", "station_road", "pending", 1.5, "feed_station_road", { id: "EVT-BRS-2401", confidence: 0.89, severity: "medium" }),
    buildEvent("crowd_congestion", "colony_more", "pending", 2, "feed_colony_more", { id: "EVT-BRS-2402", confidence: 0.84, severity: "high" }),
    buildEvent("helmet_violation", "school_zone", "pending", 0.8, "feed_school_zone", { id: "EVT-BRS-2403", confidence: 0.91, severity: "medium" }),
    buildEvent("pothole", "hridaypur", "pending", 4, undefined, { id: "EVT-BRS-2404", confidence: 0.87, severity: "high" }),
    buildEvent("waterlogging", "nabapally", "confirmed", 6, undefined, { id: "EVT-BRS-2405", confidence: 0.93, severity: "high" }),
    buildEvent("wrong_way_driving", "colony_more", "confirmed", 10, "feed_colony_more", { id: "EVT-BRS-2406", confidence: 0.88, severity: "high" }),
    buildEvent("garbage_overflow", "champadali", "confirmed", 14, undefined, { id: "EVT-BRS-2407", confidence: 0.82, severity: "medium" }),
    buildEvent("overspeeding_estimate", "school_zone", "rejected", 5, "feed_school_zone", { id: "EVT-BRS-2408", confidence: 0.61, severity: "medium" }),
    buildEvent("illegal_parking", "bus_stand", "rejected", 9, "feed_station_road", { id: "EVT-BRS-2409", confidence: 0.58, severity: "low" }),
    buildEvent("accident_near_miss", "madhyamgram_link", "needs_field_verification", 3, undefined, { id: "EVT-BRS-2410", confidence: 0.79, severity: "critical" }),
    buildEvent("road_blockage", "lichutala", "pending", 6.5, "feed_station_road", { id: "EVT-BRS-2411", confidence: 0.86, severity: "high" }),
    buildEvent("pothole", "colony_more", "confirmed", 20, undefined, { id: "EVT-BRS-2412", confidence: 0.9, severity: "medium" }),
    buildEvent("crowd_congestion", "station_road", "confirmed", 12, "feed_station_road", { id: "EVT-BRS-2413", confidence: 0.85, severity: "medium" }),
    buildEvent("helmet_violation", "barrackpore_road", "pending", 1.2, "feed_colony_more", { id: "EVT-BRS-2414", confidence: 0.92, severity: "medium" }),
    buildEvent("waterlogging", "hridaypur", "pending", 7, undefined, { id: "EVT-BRS-2415", confidence: 0.81, severity: "medium" }),
    buildEvent("illegal_parking", "nabapally", "confirmed", 18, undefined, { id: "EVT-BRS-2416", confidence: 0.88, severity: "medium" }),
    buildEvent("garbage_overflow", "station_road", "pending", 8, "feed_station_road", { id: "EVT-BRS-2417", confidence: 0.83, severity: "low" }),
    buildEvent("pothole", "deganga_road", "pending", 11, undefined, { id: "EVT-BRS-2418", confidence: 0.86, severity: "high" }),
    buildEvent("overspeeding_estimate", "madhyamgram_link", "pending", 2.5, undefined, { id: "EVT-BRS-2419", confidence: 0.74, severity: "medium" }),
    buildEvent("wrong_way_driving", "nabapally", "pending", 4.5, undefined, { id: "EVT-BRS-2420", confidence: 0.87, severity: "high" }),
    buildEvent("illegal_parking", "lichutala", "pending", 3, "feed_station_road", { id: "EVT-BRS-2421", confidence: 0.9, severity: "medium" }),
    buildEvent("crowd_congestion", "colony_more", "confirmed", 16, "feed_colony_more", { id: "EVT-BRS-2422", confidence: 0.88, severity: "high" }),
    buildEvent("pothole", "station_road", "confirmed", 22, undefined, { id: "EVT-BRS-2423", confidence: 0.84, severity: "medium" }),
    buildEvent("garbage_overflow", "kadambagachi", "pending", 13, undefined, { id: "EVT-BRS-2424", confidence: 0.8, severity: "medium" }),
    buildEvent("waterlogging", "colony_more", "confirmed", 28, undefined, { id: "EVT-BRS-2425", confidence: 0.91, severity: "critical" }),
    buildEvent("helmet_violation", "station_road", "confirmed", 15, "feed_station_road", { id: "EVT-BRS-2426", confidence: 0.89, severity: "low" }),
    buildEvent("road_blockage", "champadali", "pending", 5.5, undefined, { id: "EVT-BRS-2427", confidence: 0.85, severity: "medium" }),
    buildEvent("accident_near_miss", "colony_more", "pending", 2.2, "feed_colony_more", { id: "EVT-BRS-2428", confidence: 0.76, severity: "high" }),
    buildEvent("illegal_parking", "colony_more", "confirmed", 24, "feed_colony_more", { id: "EVT-BRS-2429", confidence: 0.87, severity: "high" }),
    buildEvent("crowd_congestion", "bus_stand", "pending", 1, "feed_station_road", { id: "EVT-BRS-2430", confidence: 0.83, severity: "medium" }),
    buildEvent("pothole", "nabapally", "pending", 9, undefined, { id: "EVT-BRS-2431", confidence: 0.88, severity: "medium" }),
    buildEvent("waterlogging", "deganga_road", "needs_field_verification", 30, undefined, { id: "EVT-BRS-2432", confidence: 0.77, severity: "high" }),
    buildEvent("garbage_overflow", "hridaypur", "confirmed", 26, undefined, { id: "EVT-BRS-2433", confidence: 0.81, severity: "low" }),
    buildEvent("wrong_way_driving", "barrackpore_road", "rejected", 19, "feed_colony_more", { id: "EVT-BRS-2434", confidence: 0.55, severity: "medium" }),
    buildEvent("overspeeding_estimate", "school_zone", "confirmed", 21, "feed_school_zone", { id: "EVT-BRS-2435", confidence: 0.72, severity: "medium" }),
  ];
}

export interface MockProcessingResult {
  events: DetectionEvent[];
  processingMs: number;
  framesAnalyzed: number;
  modelVersion: string;
}

/**
 * Simulates AI video analysis after upload or demo feed selection.
 *
 * REAL AI INTEGRATION: POST /api/videos/process with file URL,
 * poll job status, merge returned DetectionEvent[] into database.
 */
export async function processVideoMock(
  source: { fileName?: string; feedId?: string },
): Promise<MockProcessingResult> {
  const delay = 1800 + Math.random() * 1200;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const locationKeys = Object.keys(LOCATIONS) as (keyof typeof LOCATIONS)[];
  const feedLocationMap: Record<string, keyof typeof LOCATIONS> = {
    feed_station_road: "station_road",
    feed_colony_more: "colony_more",
    feed_school_zone: "school_zone",
  };

  const primaryLocation =
    (source.feedId && feedLocationMap[source.feedId]) ||
    pick(locationKeys);

  const typePool: EventType[] = source.feedId?.includes("school")
    ? ["overspeeding_estimate", "helmet_violation", "crowd_congestion", "illegal_parking"]
    : source.feedId?.includes("colony")
      ? ["wrong_way_driving", "helmet_violation", "crowd_congestion", "illegal_parking"]
      : [
          "illegal_parking",
          "pothole",
          "garbage_overflow",
          "waterlogging",
          "crowd_congestion",
          "road_blockage",
        ];

  const count = 2 + Math.floor(Math.random() * 3);
  const events: DetectionEvent[] = Array.from({ length: count }, (_, i) => {
    const type = pick(typePool);
    const loc =
      i === 0 ? primaryLocation : pick(locationKeys);
    return {
      ...buildEvent(type, loc, "pending", 0, source.feedId),
      timestamp: new Date().toISOString(),
    };
  });

  return {
    events,
    processingMs: Math.round(delay),
    framesAnalyzed: 120 + Math.floor(Math.random() * 280),
    modelVersion: "civic-mock-v0.1 (replace with YOLO/CV pipeline)",
  };
}

/** Simulate upload progress stages with realistic timing */
export async function simulateUploadProgress(
  onStage: (stage: "uploading" | "processing") => void,
  fileSizeBytes: number,
): Promise<void> {
  onStage("uploading");
  const uploadMs = Math.min(2500, 800 + fileSizeBytes / 50000);
  await new Promise((r) => setTimeout(r, uploadMs));
  onStage("processing");
}
