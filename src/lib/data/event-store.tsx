"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  DashboardStats,
  DetectionEvent,
  Hotspot,
  PilotReport,
  PrivacySettings,
  ReviewStatus,
} from "@/types";
import { getSeedEvents } from "@/lib/mock-ai/processor";
import { EVENT_TYPES } from "@/types";

const STORAGE_KEY = "civic-ai-events-v2";
const SETTINGS_KEY = "civic-ai-settings";

const DEFAULT_SETTINGS: PrivacySettings = {
  faceBlurringPlanned: true,
  numberPlateMasking: true,
  dataRetentionDays: 30,
  roleBasedAccessPlanned: true,
  auditLogsEnabled: true,
  humanReviewRequired: true,
  facialRecognitionDisabled: true,
};

function loadEvents(): DetectionEvent[] {
  if (typeof window === "undefined") return getSeedEvents();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DetectionEvent[];
  } catch {
    /* fall through */
  }
  return getSeedEvents();
}

function loadSettings(): PrivacySettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    /* fall through */
  }
  return DEFAULT_SETTINGS;
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function computeStats(events: DetectionEvent[]): DashboardStats {
  const today = events.filter((e) => isToday(e.timestamp));
  const highRiskLocationIds = new Set(
    events
      .filter((e) => e.severity === "high" || e.severity === "critical")
      .map((e) => e.location.id),
  );

  const congestionEvents = events.filter((e) => e.type === "crowd_congestion");
  const avgCongestionScore =
    congestionEvents.length > 0
      ? Math.min(
          100,
          55 +
            congestionEvents.length * 3 +
            congestionEvents.filter((e) => e.severity === "high").length * 8,
        )
      : 42;

  return {
    eventsToday: today.length,
    pendingReview: events.filter((e) => e.status === "pending").length,
    confirmed: events.filter((e) => e.status === "confirmed").length,
    rejected: events.filter((e) => e.status === "rejected").length,
    highRiskLocations: highRiskLocationIds.size,
    avgCongestionScore,
    helmetViolations: events.filter((e) => e.type === "helmet_violation").length,
    illegalParking: events.filter((e) => e.type === "illegal_parking").length,
    potholes: events.filter((e) => e.type === "pothole").length,
    waterloggingAlerts: events.filter((e) => e.type === "waterlogging").length,
  };
}

function computeHotspots(events: DetectionEvent[]): Hotspot[] {
  return [
    {
      id: "hs_parking",
      label: "High Illegal Parking Zone",
      category: "parking",
      location: events.find((e) => e.type === "illegal_parking")?.location ?? {
        id: "station_road",
        name: "Barasat Station Road",
        area: "Barasat",
        lat: 22.7219,
        lng: 88.4812,
      },
      intensity: 0.85,
      eventCount: events.filter((e) => e.type === "illegal_parking").length,
      description: "Recurring no-parking violations along Barasat Station Road and Lichutala Lane — bus terminus approach.",
    },
    {
      id: "hs_accident",
      label: "Accident-Prone Area",
      category: "accident",
      location: {
        id: "madhyamgram_link",
        name: "Barasat–Madhyamgram Link Road",
        area: "Barasat",
        lat: 22.7108,
        lng: 88.4652,
      },
      intensity: 0.72,
      eventCount: events.filter((e) => e.type === "accident_near_miss").length,
      description: "Near-miss and braking events flagged for road safety cell review.",
    },
    {
      id: "hs_pothole",
      label: "Pothole Cluster",
      category: "pothole",
      location: {
        id: "hridaypur",
        name: "Hridaypur Main Road",
        area: "Barasat",
        lat: 22.7152,
        lng: 88.4723,
      },
      intensity: 0.68,
      eventCount: events.filter((e) => e.type === "pothole").length,
      description: "Multiple surface defects reported post-monsoon — repair prioritization candidate.",
    },
    {
      id: "hs_water",
      label: "Waterlogging-Prone Road",
      category: "waterlogging",
      location: {
        id: "nabapally",
        name: "Nabapally Crossing",
        area: "Barasat",
        lat: 22.7268,
        lng: 88.4841,
      },
      intensity: 0.78,
      eventCount: events.filter((e) => e.type === "waterlogging").length,
      description: "Drainage bottleneck causes recurring standing water during heavy rain.",
    },
    {
      id: "hs_congestion",
      label: "Congestion-Heavy Junction",
      category: "congestion",
      location: {
        id: "colony_more",
        name: "Colony More Junction",
        area: "Barasat",
        lat: 22.7185,
        lng: 88.4758,
      },
      intensity: 0.91,
      eventCount: events.filter((e) => e.type === "crowd_congestion").length,
      description: "Peak-hour queue buildup — signal timing and one-way study recommended.",
    },
  ];
}

function buildReport(events: DetectionEvent[]): PilotReport {
  const locationCounts = new Map<string, { count: number; types: Map<string, number> }>();
  for (const e of events) {
    const entry = locationCounts.get(e.location.name) ?? {
      count: 0,
      types: new Map(),
    };
    entry.count += 1;
    entry.types.set(e.type, (entry.types.get(e.type) ?? 0) + 1);
    locationCounts.set(e.location.name, entry);
  }

  const topProblemAreas = [...locationCounts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([location, data]) => {
      const primaryIssue = [...data.types.entries()].sort(
        (a, b) => b[1] - a[1],
      )[0]?.[0];
      return {
        location,
        count: data.count,
        primaryIssue: primaryIssue ?? "mixed",
      };
    });

  const eventBreakdown = EVENT_TYPES.map((type) => ({
    type,
    count: events.filter((e) => e.type === type).length,
  })).filter((x) => x.count > 0);

  return {
    title: "30-Day AI Civic & Road Safety Pilot Report",
    period: "Barasat Pilot — West Bengal (30 days)",
    summary:
      "The Barasat Municipality pilot (North 24 Parganas, West Bengal) evaluated privacy-first video analytics on the Colony More Junction and Barasat Station Road corridor. Detections from existing CCTV and uploaded footage were routed through mandatory human review by municipal and traffic authorities. No automatic fines, challans, or prosecutions were issued during the pilot period.",
    totalEvents: events.length,
    topProblemAreas,
    eventBreakdown,
    suggestedInterventions: [
      "Barasat Municipality: deploy pothole repair team to Hridaypur Main Road with geo-tagged evidence pack (EVT-BRS-2404 cluster).",
      "Traffic Police: wrong-way advisory signage audit at Colony More Barrackpore–Barasat approach.",
      "Drainage department: priority inspection at Nabapally Crossing before monsoon peak (confirmed waterlogging events).",
      "Solid waste: increase collection frequency at Station Road vendor stretch near bus terminus.",
      "Transport Department: school-zone advisory speed calming at Champadali — human-verified, non-enforcement.",
      "IT/WEBEL: Phase 2 RTSP integration assessment for remaining 9 inventoried cameras.",
    ],
    privacySafeguards: [
      "Facial recognition disabled by default across pilot feeds.",
      "Face blurring and number plate masking planned for evidence exports.",
      "30-day evidence retention with audit logs for all review actions.",
      "Role-based access control planned for production rollout.",
      "Human review required before any external report or field dispatch.",
    ],
    reviewStats: {
      pending: events.filter((e) => e.status === "pending").length,
      confirmed: events.filter((e) => e.status === "confirmed").length,
      rejected: events.filter((e) => e.status === "rejected").length,
      needsFieldVerification: events.filter(
        (e) => e.status === "needs_field_verification",
      ).length,
    },
  };
}

interface EventStoreValue {
  events: DetectionEvent[];
  settings: PrivacySettings;
  stats: DashboardStats;
  hotspots: Hotspot[];
  report: PilotReport;
  hydrated: boolean;
  addEvents: (newEvents: DetectionEvent[]) => void;
  updateEventStatus: (id: string, status: ReviewStatus) => void;
  getEvent: (id: string) => DetectionEvent | undefined;
  updateSettings: (partial: Partial<PrivacySettings>) => void;
  resetDemoData: () => void;
}

const EventStoreContext = createContext<EventStoreValue | null>(null);

export function EventStoreProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<DetectionEvent[]>(getSeedEvents);
  const [settings, setSettings] = useState<PrivacySettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Client-only: load localStorage after SSR (same seed on server + first paint)
    /* eslint-disable react-hooks/set-state-in-effect -- post-mount localStorage hydration */
    setEvents(loadEvents());
    setSettings(loadSettings());
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings, hydrated]);

  const addEvents = useCallback((newEvents: DetectionEvent[]) => {
    setEvents((prev) => [...newEvents, ...prev]);
  }, []);

  const updateEventStatus = useCallback((id: string, status: ReviewStatus) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status,
              reviewedAt: new Date().toISOString(),
              reviewedBy: "Pilot Reviewer",
            }
          : e,
      ),
    );
  }, []);

  const getEvent = useCallback(
    (id: string) => events.find((e) => e.id === id),
    [events],
  );

  const updateSettings = useCallback((partial: Partial<PrivacySettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetDemoData = useCallback(() => {
    const seed = getSeedEvents();
    setEvents(seed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  }, []);

  const value = useMemo<EventStoreValue>(
    () => ({
      events,
      settings,
      stats: computeStats(events),
      hotspots: computeHotspots(events),
      report: buildReport(events),
      hydrated,
      addEvents,
      updateEventStatus,
      getEvent,
      updateSettings,
      resetDemoData,
    }),
    [
      events,
      settings,
      hydrated,
      addEvents,
      updateEventStatus,
      getEvent,
      updateSettings,
      resetDemoData,
    ],
  );

  return (
    <EventStoreContext.Provider value={value}>
      {children}
    </EventStoreContext.Provider>
  );
}

export function useEventStore() {
  const ctx = useContext(EventStoreContext);
  if (!ctx) throw new Error("useEventStore must be used within EventStoreProvider");
  return ctx;
}
