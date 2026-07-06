/** Structured content for the Pilot Proposal page — government demo / MLA pitch */

/** SYNTHETIC DEMO COPY — fictional pilot proposal for open-source demonstration only. */
export const PILOT_PROPOSAL = {
  title: "30-Day AI Civic & Road Safety Analytics Pilot",
  subtitle: "Barasat, North 24 Parganas · West Bengal",
  reference: "Pilot Ref: WB-N24-BRS-2026-01",
  issued: "July 2026",

  objective: `To demonstrate how existing CCTV and recorded video footage can be analysed—using privacy-first computer vision—to produce structured, human-reviewed alerts on civic maintenance and road safety conditions in Barasat, without deploying new surveillance infrastructure or issuing automatic penalties.

The pilot will help the Municipality, Traffic Police, and Transport Department evaluate whether AI-assisted video analytics can shorten response times for potholes, waterlogging, illegal parking, congestion hotspots, and advisory road-safety events, while keeping citizens' privacy rights at the centre of the design.`,

  scope: [
    "One arterial road and one major junction in Barasat (Colony More Junction + Barasat Station Road corridor)",
    "Integration with existing municipal/police CCTV feeds or uploaded video clips (no new camera mandate for pilot)",
    "Detection of civic issues (potholes, garbage overflow, waterlogging, road blockage) and road-safety indicators (illegal parking, wrong-way movement, helmet non-compliance, advisory speed estimation, near-miss events, congestion)",
    "Web dashboard for authorised reviewers with audit trail",
    "Weekly digest and end-of-pilot report for department heads",
    "No integration with challan, e-Naksha, or prosecution systems during pilot phase",
  ],

  pilotSite: {
    road: "Barasat Station Road (Railway Station approach to Nabapally)",
    junction: "Colony More Junction (Barasat–Barrackpore Road intersection)",
    rationale:
      "High pedestrian volume, mixed traffic, recurring parking violations, and monsoon waterlogging make this corridor representative of urban North 24 Parganas challenges. Existing CCTV coverage is already in place near the station and junction.",
    feeds: 3,
    wards: "Ward-level coordination via Barasat Municipality",
  },

  footageUsage: [
    "Use footage already captured by municipal, traffic, or commercial CCTV — no covert recording",
    "Accept MP4/WebM uploads for offline analysis during pilot workshops",
    "Optional RTSP stream connection in Phase 2 (post-pilot technical assessment)",
    "Evidence clips stored with configurable retention; faces blurred on export (planned)",
    "Number plates masked in advisory / non-enforcement mode by default",
  ],

  humanReview: [
    "Every AI detection enters a Pending Review queue",
    "Designated municipal or traffic reviewer must Confirm, Reject, or mark Field Verification Required",
    "No alert is forwarded to enforcement, towing, or billing systems without human sign-off",
    "Full audit log: reviewer ID, timestamp, action taken",
  ],

  noAutoFines: `The pilot explicitly excludes automatic challan generation, speed prosecution, facial identification, or direct linkage to prosecution databases. Speed outputs are labelled "estimation (advisory)" only. The system is positioned as civic intelligence and road safety analytics—not automated enforcement.`,

  expectedOutcomes: [
    "Baseline map of civic and traffic hotspots along the pilot corridor",
    "Quantified false-positive rate after human review tuning",
    "Average time from detection to confirmed field ticket (target: under 24 hours for high severity)",
    "Department-ready evidence packs (geo-tagged clips + descriptions) for PWD, solid waste, and drainage teams",
    "Recommendation memo on scale-up to additional wards or Barrackpore–Barasat corridor",
    "Privacy impact assessment draft for IT/WEBEL and legal review",
  ],

  privacySafeguards: [
    "Facial recognition disabled by default — not available in pilot build",
    "Face blurring on all exported evidence clips (implementation planned Week 2)",
    "Number plate masking in non-enforcement mode",
    "30-day evidence retention (configurable); auto-purge thereafter",
    "Role-based access: Viewer, Reviewer, Administrator (production rollout)",
    "Audit logs for every review action and export",
    "Data hosted within India-region cloud (production requirement)",
    "DPIA / legal review before any production deployment",
  ],

  departments: [
    {
      name: "Barasat Municipality",
      role: "Lead civic partner — solid waste, drainage, pothole response, ward coordination",
      contact: "Municipal Commissioner office / Ward Engineers",
    },
    {
      name: "District Traffic & Police",
      role: "Road safety review, junction management, advisory interventions (no auto-challan)",
      contact: "Barasat Traffic Guard / District Traffic Superintendent",
    },
    {
      name: "Transport Department, West Bengal",
      role: "Policy alignment, road safety cell, scale-up guidance for state corridors",
      contact: "State Transport Authority — Road Safety Wing",
    },
    {
      name: "IT / WEBEL",
      role: "Technical hosting, security audit, integration with smart city stack",
      contact: "WEBEL Technology Ltd. / State IT & Electronics Department",
    },
  ],

  timeline: [
    {
      week: "Week 1",
      title: "Onboarding & baseline",
      tasks: [
        "MoU / pilot letter of intent signed",
        "CCTV feed inventory and privacy settings configured",
        "Reviewer training (2 sessions) — Confirm / Reject workflow",
        "Baseline hotspot map from historical uploads",
      ],
    },
    {
      week: "Week 2",
      title: "Live detection & tuning",
      tasks: [
        "Daily human review cadence established",
        "False-positive feedback loop with AI vendor",
        "Face-blur pipeline enabled on exports",
        "First weekly digest to department heads",
      ],
    },
    {
      week: "Week 3",
      title: "Field verification",
      tasks: [
        "Joint field visits for top 5 hotspots",
        "Cross-department ticket routing tested (PWD, waste, drainage)",
        "Congestion score calibration at Colony More peak hours",
      ],
    },
    {
      week: "Week 4",
      title: "Evaluation & report",
      tasks: [
        "30-day pilot report and presentation to stakeholders",
        "Success metrics vs. targets",
        "Scale-up roadmap and budget estimate for Phase 2",
        "Privacy impact assessment handover",
      ],
    },
  ],

  successMetrics: [
    {
      metric: "Review coverage",
      target: "≥ 95% of detections reviewed within 48 hours",
      measure: "Pending queue age dashboard",
    },
    {
      metric: "Confirmed civic issues actioned",
      target: "≥ 70% of confirmed pothole/waste/waterlogging events receive field response within 72h",
      measure: "Municipal ticket cross-reference",
    },
    {
      metric: "False positive rate",
      target: "< 25% after Week 2 tuning",
      measure: "Rejected ÷ total reviewed",
    },
    {
      metric: "Hotspot identification",
      target: "Identify top 5 recurring locations with ≥ 3 corroborated events each",
      measure: "Hotspot map module",
    },
    {
      metric: "Privacy compliance",
      target: "Zero facial recognition queries; 100% audit log coverage",
      measure: "Settings audit + log export",
    },
    {
      metric: "Stakeholder satisfaction",
      target: "≥ 4/5 rating from reviewers on usability survey",
      measure: "End-of-pilot survey (Municipality + Traffic)",
    },
  ],
};
