import {
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  Landmark,
  Shield,
  Target,
  Users,
} from "lucide-react";
import { PrintButton } from "@/components/pilot/print-button";
import { LandingNav } from "@/components/layout/landing-nav";
import { LandingFooter } from "@/components/layout/landing-footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LinkButton } from "@/components/ui/link-button";
import { MvpDisclaimers } from "@/components/legal/mvp-disclaimers";
import { PILOT_PROPOSAL } from "@/lib/data/pilot-proposal";
import { DISCLAIMER, PILOT_CORRIDOR } from "@/lib/constants";
import { PILOT_CAMERAS_TOTAL, PILOT_WARDS } from "@/lib/data/locations";

export const metadata = {
  title: "Pilot Proposal",
};

export default function PilotProposalPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav variant="proposal" />

      <div className="border-b bg-gradient-to-r from-primary/10 via-background to-primary/5">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Government Pilot Proposal</Badge>
            <Badge variant="outline">{PILOT_PROPOSAL.reference}</Badge>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {PILOT_PROPOSAL.title}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">{PILOT_PROPOSAL.subtitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">Issued: {PILOT_PROPOSAL.issued}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton href="/dashboard">View Live Dashboard</LinkButton>
            <LinkButton variant="outline" href="/dashboard/reports">
              <FileText className="size-4" data-icon="inline-start" />
              Pilot Report
            </LinkButton>
          </div>
        </div>
      </div>

      <article className="mx-auto w-full min-w-0 max-w-4xl flex-1 px-4 py-10 sm:px-6 print:max-w-none">
        <Alert className="mb-10">
          <Shield className="size-4" />
          <AlertTitle>Advisory intelligence — not automated enforcement</AlertTitle>
          <AlertDescription>{DISCLAIMER}</AlertDescription>
        </Alert>

        <div className="mb-10">
          <MvpDisclaimers />
        </div>

        <section id="objective" className="mb-12 scroll-mt-24">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Target className="size-5 text-primary" />
            Objective
          </h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {PILOT_PROPOSAL.objective}
          </p>
        </section>

        <section id="scope" className="mb-12 scroll-mt-24">
          <h2 className="text-xl font-semibold">Scope of work</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {PILOT_PROPOSAL.scope.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section id="pilot-site" className="mb-12 scroll-mt-24">
          <h2 className="text-xl font-semibold">One-road / one-junction pilot site</h2>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">{PILOT_CORRIDOR}</CardTitle>
              <CardDescription>
                {PILOT_WARDS.join(" · ")} · {PILOT_CAMERAS_TOTAL} existing cameras inventoried
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/40 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Arterial road</p>
                  <p className="mt-1 font-medium">{PILOT_PROPOSAL.pilotSite.road}</p>
                </div>
                <div className="rounded-lg border bg-muted/40 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Junction</p>
                  <p className="mt-1 font-medium">{PILOT_PROPOSAL.pilotSite.junction}</p>
                </div>
              </div>
              <p className="leading-relaxed text-muted-foreground">{PILOT_PROPOSAL.pilotSite.rationale}</p>
            </CardContent>
          </Card>
        </section>

        <section id="footage" className="mb-12 scroll-mt-24">
          <h2 className="text-xl font-semibold">Existing CCTV &amp; video footage</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {PILOT_PROPOSAL.footageUsage.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section id="challenges" className="mb-12 scroll-mt-24">
          <h2 className="text-xl font-semibold">Human-reviewed detections</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {PILOT_PROPOSAL.humanReview.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section id="no-auto-fines" className="mb-12 scroll-mt-24 rounded-lg border border-destructive/30 bg-destructive/5 p-6">
          <h2 className="text-xl font-semibold">No automatic fines or challans</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {PILOT_PROPOSAL.noAutoFines}
          </p>
        </section>

        <section id="timeline" className="mb-12 scroll-mt-24">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Calendar className="size-5 text-primary" />
            30-day timeline
          </h2>
          <div className="mt-6 flex flex-col gap-4">
            {PILOT_PROPOSAL.timeline.map((phase) => (
              <div key={phase.week} className="flex gap-4 border-l-2 border-primary/30 pl-4">
                <div>
                  <Badge>{phase.week}</Badge>
                  <p className="mt-2 font-medium">{phase.title}</p>
                  <ul className="mt-2 flex flex-col gap-1">
                    {phase.tasks.map((t) => (
                      <li key={t} className="text-sm text-muted-foreground">· {t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="privacy" className="mb-12 scroll-mt-24">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Shield className="size-5 text-primary" />
            Privacy safeguards
          </h2>
          <ul className="mt-4 flex flex-col gap-2">
            {PILOT_PROPOSAL.privacySafeguards.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section id="outcomes" className="mb-12 scroll-mt-24">
          <h2 className="text-xl font-semibold">Expected outcomes</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            {PILOT_PROPOSAL.expectedOutcomes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section id="security" className="mb-12 scroll-mt-24">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Users className="size-5 text-primary" />
            Security &amp; departments involved
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Municipal, traffic, and civic agencies in the pilot governance loop.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {PILOT_PROPOSAL.departments.map((dept) => (
              <Card key={dept.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-2">
                    <Building2 className="mt-0.5 size-4 text-primary" />
                    <CardTitle className="text-base">{dept.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>{dept.role}</p>
                  <p className="mt-2 text-xs">{dept.contact}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="success-metrics" className="mb-12 scroll-mt-24">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Landmark className="size-5 text-primary" />
            Success metrics
          </h2>
          <div className="mt-4 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="p-3 font-medium">Metric</th>
                  <th className="p-3 font-medium">Target</th>
                  <th className="p-3 font-medium">Measurement</th>
                </tr>
              </thead>
              <tbody>
                {PILOT_PROPOSAL.successMetrics.map((row) => (
                  <tr key={row.metric} className="border-b last:border-0">
                    <td className="p-3 font-medium">{row.metric}</td>
                    <td className="p-3 text-muted-foreground">{row.target}</td>
                    <td className="p-3 text-muted-foreground">{row.measure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <Separator className="my-10" />

        <div className="flex flex-col items-center gap-4 text-center print:hidden">
          <p className="text-sm text-muted-foreground">
            Interactive demo dashboard available for stakeholder walkthrough.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <LinkButton size="lg" href="/dashboard">
              Open Dashboard Demo
            </LinkButton>
            <PrintButton />
          </div>
        </div>
      </article>

      <LandingFooter />
    </div>
  );
}
