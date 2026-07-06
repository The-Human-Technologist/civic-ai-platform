/**
 * SYNTHETIC DEMO DATA — public place names around Barasat, West Bengal.
 * Coordinates are approximate values for map visualization only.
 * No real individuals, vehicles, or enforcement records.
 * See src/lib/data/README.md and PRIVACY.md
 */
import type { CameraFeed, Location } from "@/types";
export const LOCATIONS: Record<string, Location> = {
  station_road: {
    id: "station_road",
    name: "Barasat Station Road",
    area: "Barasat Municipality, North 24 Parganas",
    lat: 22.7219,
    lng: 88.4812,
  },
  colony_more: {
    id: "colony_more",
    name: "Colony More Junction",
    area: "Barasat Municipality, North 24 Parganas",
    lat: 22.7185,
    lng: 88.4758,
  },
  school_zone: {
    id: "school_zone",
    name: "Barasat Indira Gandhi Memorial High School Zone",
    area: "Champadali, Barasat",
    lat: 22.7241,
    lng: 88.4695,
  },
  nabapally: {
    id: "nabapally",
    name: "Nabapally Crossing",
    area: "Barasat Municipality, North 24 Parganas",
    lat: 22.7268,
    lng: 88.4841,
  },
  hridaypur: {
    id: "hridaypur",
    name: "Hridaypur Main Road",
    area: "Hridaypur, Barasat",
    lat: 22.7152,
    lng: 88.4723,
  },
  champadali: {
    id: "champadali",
    name: "Champadali More",
    area: "Barasat Municipality, North 24 Parganas",
    lat: 22.7295,
    lng: 88.4789,
  },
  madhyamgram_link: {
    id: "madhyamgram_link",
    name: "Barasat–Madhyamgram Road (NH-112 stretch)",
    area: "Near Barasat, North 24 Parganas",
    lat: 22.7108,
    lng: 88.4652,
  },
  lichutala: {
    id: "lichutala",
    name: "Lichutala Lane (Station approach)",
    area: "Barasat, North 24 Parganas",
    lat: 22.7228,
    lng: 88.4798,
  },
  bus_stand: {
    id: "bus_stand",
    name: "Barasat Bus Terminus",
    area: "Station Road, Barasat",
    lat: 22.7205,
    lng: 88.4825,
  },
  kadambagachi: {
    id: "kadambagachi",
    name: "Kadambagachi Crossing",
    area: "Barasat outskirts, North 24 Parganas",
    lat: 22.7332,
    lng: 88.4915,
  },
  deganga_road: {
    id: "deganga_road",
    name: "Deganga Road (Barasat section)",
    area: "North 24 Parganas",
    lat: 22.7145,
    lng: 88.4882,
  },
  barrackpore_road: {
    id: "barrackpore_road",
    name: "Barrackpore–Barasat Road",
    area: "Colony More northbound",
    lat: 22.7198,
    lng: 88.4742,
  },
};

export const DEMO_FEEDS: CameraFeed[] = [
  {
    id: "feed_station_road",
    name: "Barasat Station Road",
    location: LOCATIONS.station_road,
    status: "online",
    description:
      "Municipal CCTV — railway station approach. Pilot corridor: illegal parking, congestion, waste near vendors.",
    thumbnailLabel: "BMC-CAM-01 · Station Road",
  },
  {
    id: "feed_colony_more",
    name: "Colony More Junction",
    location: LOCATIONS.colony_more,
    status: "online",
    description:
      "Traffic police shared feed — Barrackpore–Barasat intersection. Wrong-way movement, helmet advisory, peak-hour congestion.",
    thumbnailLabel: "TP-CAM-02 · Colony More",
  },
  {
    id: "feed_school_zone",
    name: "Champadali School Zone",
    location: LOCATIONS.school_zone,
    status: "demo",
    description:
      "Uploaded clip — school zone advisory speed estimation and pedestrian safety (non-enforcement).",
    thumbnailLabel: "UPLOAD-CAM-03 · School Zone",
  },
];

export const PILOT_CAMERAS_TOTAL = 12;
export const PILOT_WARDS = ["Ward 12", "Ward 14", "Ward 15"];
