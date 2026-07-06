"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
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

const CHART_LABEL_STYLE = { fill: "#ffffff", fontSize: 12, fontWeight: 600 } as const;

const CHART_COLORS = [
  "hsl(220 70% 45%)",
  "hsl(200 65% 42%)",
  "hsl(175 55% 38%)",
  "hsl(250 50% 50%)",
  "hsl(210 60% 55%)",
  "hsl(190 50% 45%)",
];

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function ChartMount({ children, className }: { children: ReactNode; className?: string }) {
  const mounted = useIsClient();
  return (
    <div className={className}>
      {mounted ? (
        children
      ) : (
        <div className="h-full w-full animate-pulse rounded-md bg-muted" aria-hidden />
      )}
    </div>
  );
}

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
      <CardContent className="h-72 min-w-0">
        <ChartMount className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={108}
                tick={{ fontSize: 11 }}
                tickFormatter={(v: string) => (v.length > 18 ? `${v.slice(0, 16)}…` : v)}
              />
            <Tooltip />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              <LabelList dataKey="count" position="insideRight" offset={8} style={CHART_LABEL_STYLE} />
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        </ChartMount>
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
      <CardContent className="min-w-0">
        <ChartMount className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={78}
              paddingAngle={3}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        </ChartMount>
        <ul className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2">
          {data.map((item, i) => (
            <li key={item.name} className="flex items-center gap-2 text-sm">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
              />
              <span className="text-muted-foreground">{item.name}</span>
              <span className="font-semibold tabular-nums">{item.value}</span>
            </li>
          ))}
        </ul>
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
      <CardContent className="h-64 min-w-0">
        <ChartMount className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
          <BarChart data={counts} margin={{ top: 20, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="events" fill="hsl(220 70% 45%)" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="events" position="insideTop" offset={6} style={CHART_LABEL_STYLE} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        </ChartMount>
      </CardContent>
    </Card>
  );
}
