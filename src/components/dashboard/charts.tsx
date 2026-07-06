"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DetectionEvent } from "@/types";
import { EVENT_TYPE_LABELS } from "@/lib/constants";

const CHART_COLORS = [
  "hsl(220 70% 45%)",
  "hsl(200 65% 42%)",
  "hsl(175 55% 38%)",
  "hsl(250 50% 50%)",
  "hsl(210 60% 55%)",
  "hsl(190 50% 45%)",
];

export function EventsByTypeChart({ events }: { events: DetectionEvent[] }) {
  const data = Object.entries(
    events.reduce<Record<string, number>>((acc, e) => {
      const label = EVENT_TYPE_LABELS[e.type];
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Detection categories</CardTitle>
        <CardDescription>Barasat pilot corridor — reviewed &amp; pending events</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ReviewStatusChart({
  pending,
  confirmed,
  rejected,
  needsField,
}: {
  pending: number;
  confirmed: number;
  rejected: number;
  needsField: number;
}) {
  const data = [
    { name: "Pending", value: pending },
    { name: "Confirmed", value: confirmed },
    { name: "Rejected", value: rejected },
    { name: "Field verify", value: needsField },
  ].filter((d) => d.value > 0);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Human review outcomes</CardTitle>
        <CardDescription>Municipal &amp; traffic authority disposition</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/** Illustrative weekly volumes when event data is sparse (deterministic demo) */
const WEEKLY_DEMO_FALLBACK = [3, 5, 4, 6, 8, 4, 2] as const;

export function WeeklyTrendChart({ events }: { events: DetectionEvent[] }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const counts = days.map((day, i) => {
    const count = events.filter((e) => {
      const d = new Date(e.timestamp);
      return d.getDay() === (i + 1) % 7;
    }).length;
    return { day, events: count || WEEKLY_DEMO_FALLBACK[i] };
  });

  return (
    <Card className="shadow-sm lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Weekly detection volume</CardTitle>
        <CardDescription>Pilot period trend — Station Road &amp; Colony More corridor</CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={counts}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="events" fill="hsl(220 70% 45%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
