"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  ExternalLink,
  Shield,
  XCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import {
  ALLOWED_SOURCE_SUMMARY,
  DATA_SOURCE_KIND_LABELS,
  DATA_SOURCE_STATUS_LABELS,
  dataSources,
  FOOTAGE_WORKFLOW_STEPS,
  NOT_ALLOWED_SOURCE_SUMMARY,
  PILOT_FOOTAGE_REQUIREMENTS,
  PRIVACY_CHECKLIST,
} from "@/lib/data-sources";
import { cn } from "@/lib/utils";

const riskVariant = {
  low: "secondary",
  medium: "outline",
  high: "destructive",
} as const;

export default function DataSourcesPage() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Sources &amp; Footage Policy</h1>
        <p className="text-sm text-muted-foreground">
          Licensed datasets, stock footage guidance, and pilot rules — mock detections only in v0.1
        </p>
      </div>

      <Alert variant="default" className="border-amber-500/50 bg-amber-500/5">
        <AlertTriangle className="size-4 text-amber-600" />
        <AlertTitle>MVP: mock detections only</AlertTitle>
        <AlertDescription>
          This repository does <strong>not</strong> bundle CCTV footage or video datasets. The
          prototype performs real inference only on explicitly authorized uploads; synthetic
          scenarios remain clearly labeled. See{" "}
          <Link
            href="https://github.com/The-Human-Technologist/civic-ai-platform/blob/master/DATA_SOURCES.md"
            className="font-medium underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            DATA_SOURCES.md
          </Link>{" "}
          and the{" "}
          <Link href="/dashboard/demo-footage" className="font-medium underline underline-offset-2">
            Sample Footage Library
          </Link>{" "}
          in the repository.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-emerald-500/30 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="size-4" />
              Allowed sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {ALLOWED_SOURCE_SUMMARY.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-destructive/30 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <XCircle className="size-4" />
              Not allowed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {NOT_ALLOWED_SOURCE_SUMMARY.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-destructive">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="size-4" />
            Dataset &amp; source registry
          </CardTitle>
          <CardDescription>
            Metadata only — no video files in the repository. External downloads are manual.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid gap-3 md:grid-cols-2">
            {dataSources.map((source) => (
              <div key={source.id} className="flex min-w-0 flex-col rounded-lg border bg-muted/20 p-4">
                <p className="font-medium leading-snug">{source.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {DATA_SOURCE_KIND_LABELS[source.kind]}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{source.purpose}</p>
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Official link
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                ) : (
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{source.licenseNote}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline" className="max-w-full whitespace-normal text-xs font-normal">
                    {DATA_SOURCE_STATUS_LABELS[source.status]}
                  </Badge>
                  <Badge
                    variant={riskVariant[source.privacyRisk]}
                    className="text-xs capitalize"
                  >
                    {source.privacyRisk} risk
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Recommended footage workflow (Phase 2+)</CardTitle>
          <CardDescription>Human-reviewed civic intelligence — not automatic enforcement</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-col gap-3">
            {FOOTAGE_WORKFLOW_STEPS.map((step, i) => (
              <li key={step} className="flex gap-3 text-sm">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground",
                  )}
                >
                  {i + 1}
                </span>
                <span className="pt-0.5 text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-muted-foreground">
            Local setup: <code className="rounded bg-muted px-1">npm run prepare:data</code> creates
            gitignored <code className="rounded bg-muted px-1">data/</code> folders.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="size-4" />
              Pilot footage request
            </CardTitle>
            <CardDescription>30-day municipality pilot — written authorization required</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {PILOT_FOOTAGE_REQUIREMENTS.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <LinkButton href="/pilot-proposal" variant="outline" size="sm" className="mt-4">
              View pilot proposal
            </LinkButton>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Contributor privacy checklist</CardTitle>
            <CardDescription>Before PRs involving data or demos</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {PRIVACY_CHECKLIST.map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        We do not claim training on real Kolkata/Barasat CCTV in v0.1. Random open CCTV scraping is
        prohibited. See CONTRIBUTING.md and PRIVACY.md in the repository.
      </p>
    </div>
  );
}
