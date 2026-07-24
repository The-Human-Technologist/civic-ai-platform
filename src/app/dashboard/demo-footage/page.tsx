"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink, Film, MapPin, Play } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  demoFootageLibrary,
  DEMO_FOOTAGE_GROUPS,
  DEMO_FOOTAGE_TYPE_LABELS,
  LICENSE_STATUS_LABELS,
  PRIVACY_RISK_LABELS,
  type DemoFootage,
  type DemoFootageType,
  type LicenseStatus,
} from "@/lib/demo-footage";

const licenseBadgeVariant: Record<
  LicenseStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  verified: "secondary",
  manual_verification_required: "outline",
  not_for_redistribution: "outline",
  requires_permission: "destructive",
};

const riskBadgeVariant = {
  low: "secondary",
  medium: "outline",
  high: "destructive",
} as const;

function matchesFilters(
  entry: DemoFootage,
  typeFilter: string,
  licenseFilter: string,
  riskFilter: string,
): boolean {
  if (typeFilter !== "all" && entry.type !== typeFilter) return false;
  if (licenseFilter !== "all" && entry.licenseStatus !== licenseFilter) return false;
  if (riskFilter !== "all" && entry.privacyRisk !== riskFilter) return false;
  return true;
}

export default function DemoFootagePage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [licenseFilter, setLicenseFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  const entryMap = useMemo(
    () => new Map(demoFootageLibrary.map((e) => [e.id, e])),
    [],
  );

  const groupedSections = useMemo(() => {
    return DEMO_FOOTAGE_GROUPS.map((group) => ({
      ...group,
      entries: group.entryIds
        .map((id) => entryMap.get(id))
        .filter((e): e is DemoFootage => !!e)
        .filter((e) => matchesFilters(e, typeFilter, licenseFilter, riskFilter)),
    })).filter((g) => g.entries.length > 0);
  }, [entryMap, typeFilter, licenseFilter, riskFilter]);

  const totalVisible = groupedSections.reduce((n, g) => n + g.entries.length, 0);

  return (
    <div className="flex w-full min-w-0 flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Sample Footage Library</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Metadata catalog for safe civic demos — synthetic placeholders and external source
          candidates. No raw video is bundled in this repository.
        </p>
      </div>

      <Alert className="border-amber-600/40 bg-amber-50 shadow-sm dark:border-amber-500/30 dark:bg-amber-950/30">
        <AlertTriangle className="size-5 text-amber-700 dark:text-amber-400" />
        <AlertTitle className="text-base font-semibold text-amber-950 dark:text-amber-100">
          No raw footage in this repository
        </AlertTitle>
        <AlertDescription className="mt-2 text-sm leading-relaxed text-amber-900/90 dark:text-amber-100/90">
          This repository does not include raw footage. Sample entries are metadata, placeholders, or
          external source references only. Use licensed, synthetic, or officially authorized footage.
          Do not scrape CCTV streams. See{" "}
          <Link
            href="/dashboard/data-sources"
            className="font-medium underline underline-offset-2 hover:text-amber-950 dark:hover:text-white"
          >
            Data Sources
          </Link>{" "}
          and{" "}
          <a
            href="https://github.com/The-Human-Technologist/civic-ai-platform/blob/master/docs/demo-footage-library.md"
            className="font-medium underline underline-offset-2 hover:text-amber-950 dark:hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            docs/demo-footage-library.md
          </a>
          .
        </AlertDescription>
      </Alert>

      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end sm:gap-6">
        <div className="flex flex-col gap-1.5 sm:min-w-[200px]">
          <label htmlFor="filter-type" className="text-xs font-medium text-muted-foreground">
            Type
          </label>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
            <SelectTrigger id="filter-type" className="w-full">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {(Object.keys(DEMO_FOOTAGE_TYPE_LABELS) as DemoFootageType[]).map((t) => (
                <SelectItem key={t} value={t}>
                  {DEMO_FOOTAGE_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5 sm:min-w-[220px]">
          <label htmlFor="filter-license" className="text-xs font-medium text-muted-foreground">
            License status
          </label>
          <Select value={licenseFilter} onValueChange={(v) => setLicenseFilter(v ?? "all")}>
            <SelectTrigger id="filter-license" className="w-full">
              <SelectValue placeholder="All licenses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {(Object.keys(LICENSE_STATUS_LABELS) as LicenseStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {LICENSE_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5 sm:min-w-[180px]">
          <label htmlFor="filter-risk" className="text-xs font-medium text-muted-foreground">
            Privacy risk
          </label>
          <Select value={riskFilter} onValueChange={(v) => setRiskFilter(v ?? "all")}>
            <SelectTrigger id="filter-risk" className="w-full">
              <SelectValue placeholder="All risks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All risks</SelectItem>
              <SelectItem value="low">Low privacy risk</SelectItem>
              <SelectItem value="medium">Medium privacy risk</SelectItem>
              <SelectItem value="high">High privacy risk</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground sm:ml-auto sm:pb-2">
          <Film className="mr-1.5 inline size-4 align-text-bottom" />
          {totalVisible} {totalVisible === 1 ? "entry" : "entries"}
        </p>
      </div>

      {groupedSections.length === 0 ? (
        <Card className="border-dashed shadow-sm">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No entries match the current filters. Try resetting one or more filters above.
          </CardContent>
        </Card>
      ) : (
        groupedSections.map((group) => (
          <section key={group.id} className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{group.title}</h2>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{group.description}</p>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {group.entries.map((entry) => (
                <FootageCard key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function FootageCard({ entry }: { entry: DemoFootage }) {
  const isSynthetic = entry.type === "synthetic_placeholder";

  return (
    <Card className="flex h-full flex-col shadow-sm">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="font-normal">
            {DEMO_FOOTAGE_TYPE_LABELS[entry.type]}
          </Badge>
          <Badge variant={licenseBadgeVariant[entry.licenseStatus]} className="font-normal">
            {LICENSE_STATUS_LABELS[entry.licenseStatus]}
          </Badge>
          <Badge variant={riskBadgeVariant[entry.privacyRisk]} className="font-normal">
            {PRIVACY_RISK_LABELS[entry.privacyRisk]}
          </Badge>
        </div>
        <div>
          <CardTitle className="text-lg leading-snug">{entry.title}</CardTitle>
          <CardDescription className="mt-1.5 flex items-start gap-1.5">
            <MapPin className="mt-0.5 size-3.5 shrink-0" />
            <span>{entry.locationLabel}</span>
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 text-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Use case
          </p>
          <p className="mt-1 leading-relaxed text-foreground">{entry.useCase}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Description
          </p>
          <p className="mt-1 leading-relaxed text-muted-foreground">{entry.description}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Source
          </p>
          <p className="mt-1 leading-relaxed">
            {entry.sourceUrl ? (
              <a
                href={entry.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-1.5 font-medium text-primary hover:underline"
              >
                <span className="break-words">{entry.sourceName}</span>
                <ExternalLink className="mt-0.5 size-3.5 shrink-0" />
              </a>
            ) : (
              <span className="text-foreground">{entry.sourceName}</span>
            )}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{entry.licenseNote}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Suggested detections
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {entry.suggestedDetections.map((d) => (
              <Badge key={d} variant="secondary" className="font-normal">
                {d}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              Allowed use
            </p>
            <ul className="mt-2 space-y-1.5 text-muted-foreground">
              {entry.allowedUse.map((u) => (
                <li key={u} className="flex gap-2 leading-relaxed">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                  <span>{u}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-destructive">
              Not allowed
            </p>
            <ul className="mt-2 space-y-1.5 text-muted-foreground">
              {entry.notAllowed.map((n) => (
                <li key={n} className="flex gap-2 leading-relaxed">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-destructive" aria-hidden />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {isSynthetic && (
          <div className="mt-auto pt-2">
            <LinkButton
              href={`/dashboard/upload?demo=${entry.id}`}
              size="sm"
              className="w-full sm:w-auto"
            >
              <Play className="size-4" data-icon="inline-start" />
              Use Synthetic Sample
            </LinkButton>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
