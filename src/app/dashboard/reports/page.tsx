"use client";

import { useRef } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useEventStore } from "@/lib/data/event-store";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";

export default function ReportsPage() {
  const { report, hydrated } = useEventStore();
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    window.print();
  }

  if (!hydrated) return <DashboardLoading />;

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-2 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pilot Report</h1>
          <p className="text-sm text-muted-foreground">Print-friendly 30-day summary for stakeholders</p>
        </div>
        <Button onClick={handlePrint}>
          <Printer className="size-4" data-icon="inline-start" />
          Print / Save as PDF
        </Button>
      </div>

      <div
        ref={printRef}
        className="pilot-report-print rounded-xl border bg-card p-6 shadow-sm sm:p-10"
      >
        <header className="border-b pb-6 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            West Bengal · Barasat Pilot
          </p>
          <h2 className="mt-2 text-2xl font-bold">{report.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{report.period}</p>
        </header>

        <section className="mt-8">
          <h3 className="text-lg font-semibold">Executive summary</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{report.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>Total events: {report.totalEvents}</Badge>
            <Badge variant="outline">Confirmed: {report.reviewStats.confirmed}</Badge>
            <Badge variant="outline">Pending: {report.reviewStats.pending}</Badge>
            <Badge variant="outline">Rejected FP: {report.reviewStats.rejected}</Badge>
          </div>
        </section>

        <Separator className="my-8" />

        <section>
          <h3 className="text-lg font-semibold">Top 5 problem areas</h3>
          <div className="mt-4 flex flex-col gap-3">
            {report.topProblemAreas.map((area, i) => (
              <div key={area.location} className="flex items-start gap-3 rounded-lg border p-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium">{area.location}</p>
                  <p className="text-sm text-muted-foreground">
                    {area.count} events · Primary: {EVENT_TYPE_LABELS[area.primaryIssue as keyof typeof EVENT_TYPE_LABELS] ?? area.primaryIssue}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator className="my-8" />

        <section className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold">Event breakdown</h3>
            <ul className="mt-4 flex flex-col gap-2">
              {report.eventBreakdown.map((item) => (
                <li key={item.type} className="flex justify-between text-sm">
                  <span>{EVENT_TYPE_LABELS[item.type]}</span>
                  <span className="font-medium">{item.count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Human review statistics</h3>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              <li className="flex justify-between"><span>Pending review</span><span>{report.reviewStats.pending}</span></li>
              <li className="flex justify-between"><span>Confirmed</span><span>{report.reviewStats.confirmed}</span></li>
              <li className="flex justify-between"><span>Rejected (false positive)</span><span>{report.reviewStats.rejected}</span></li>
              <li className="flex justify-between"><span>Needs field verification</span><span>{report.reviewStats.needsFieldVerification}</span></li>
            </ul>
          </div>
        </section>

        <Separator className="my-8" />

        <section>
          <h3 className="text-lg font-semibold">Suggested interventions</h3>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            {report.suggestedInterventions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <Separator className="my-8" />

        <section>
          <h3 className="text-lg font-semibold">Privacy safeguards</h3>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {report.privacySafeguards.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <footer className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
          Generated from AI Civic &amp; Road Safety Intelligence Platform · Working prototype · No automatic enforcement
        </footer>
      </div>
    </div>
  );
}
