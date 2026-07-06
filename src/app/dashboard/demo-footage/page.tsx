"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink, Film } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  demoFootageLibrary,
  DEMO_FOOTAGE_TYPE_LABELS,
  LICENSE_STATUS_LABELS,
  type DemoFootageType,
  type LicenseStatus,
} from "@/lib/demo-footage";

const riskVariant = {
  low: "secondary",
  medium: "outline",
  high: "destructive",
} as const;

export default function DemoFootagePage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [licenseFilter, setLicenseFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return demoFootageLibrary.filter((entry) => {
      if (typeFilter !== "all" && entry.type !== typeFilter) return false;
      if (licenseFilter !== "all" && entry.licenseStatus !== licenseFilter) return false;
      if (riskFilter !== "all" && entry.privacyRisk !== riskFilter) return false;
      return true;
    });
  }, [typeFilter, licenseFilter, riskFilter]);

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Demo Footage Library</h1>
        <p className="text-sm text-muted-foreground">
          Metadata catalog for safe demos — synthetic placeholders and external source candidates
        </p>
      </div>

      <Alert variant="default" className="border-amber-500/50 bg-amber-500/5">
        <AlertTriangle className="size-4 text-amber-600" />
        <AlertTitle>No raw footage in this repository</AlertTitle>
        <AlertDescription>
          Demo entries are <strong>metadata, placeholders, or external source references</strong> only.
          Use licensed, synthetic, or officially authorized footage. See{" "}
          <Link href="/dashboard/data-sources" className="font-medium underline underline-offset-2">
            Data Sources
          </Link>{" "}
          and{" "}
          <a
            href="https://github.com/The-Human-Technologist/civic-ai-platform/blob/master/docs/demo-footage-library.md"
            className="font-medium underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            docs/demo-footage-library.md
          </a>
          .
        </AlertDescription>
      </Alert>

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:flex-wrap">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Type</label>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
            <SelectTrigger className="w-full min-w-[180px]">
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
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">License status</label>
          <Select value={licenseFilter} onValueChange={(v) => setLicenseFilter(v ?? "all")}>
            <SelectTrigger className="w-full min-w-[200px]">
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
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Privacy risk</label>
          <Select value={riskFilter} onValueChange={(v) => setRiskFilter(v ?? "all")}>
            <SelectTrigger className="w-full min-w-[140px]">
              <SelectValue placeholder="All risks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All risks</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 lg:hidden">
        {filtered.map((entry) => (
          <FootageDetailCard key={entry.id} entry={entry} />
        ))}
      </div>

      <Card className="hidden shadow-sm lg:block">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Film className="size-4" />
            Library entries ({filtered.length})
          </CardTitle>
          <CardDescription>Metadata only — no video files bundled</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0 pb-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Use case</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="min-w-[180px] font-medium">{entry.title}</TableCell>
                  <TableCell className="text-xs">
                    {DEMO_FOOTAGE_TYPE_LABELS[entry.type]}
                  </TableCell>
                  <TableCell className="max-w-[160px] text-xs text-muted-foreground">
                    {entry.useCase}
                  </TableCell>
                  <TableCell className="text-xs">
                    {entry.sourceUrl ? (
                      <a
                        href={entry.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        {entry.sourceName}
                        <ExternalLink className="size-3" />
                      </a>
                    ) : (
                      entry.sourceName
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="whitespace-nowrap text-xs font-normal">
                      {LICENSE_STATUS_LABELS[entry.licenseStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={riskVariant[entry.privacyRisk]}
                      className="text-xs capitalize"
                    >
                      {entry.privacyRisk}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function FootageDetailCard({ entry }: { entry: (typeof demoFootageLibrary)[number] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{entry.title}</CardTitle>
        <CardDescription>
          {DEMO_FOOTAGE_TYPE_LABELS[entry.type]} · {entry.locationLabel}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm md:grid-cols-2">
        <div>
          <p className="font-medium text-foreground">Suggested detections</p>
          <ul className="mt-1 list-inside list-disc text-muted-foreground">
            {entry.suggestedDetections.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium text-foreground">Allowed use</p>
          <ul className="mt-1 list-inside list-disc text-muted-foreground">
            {entry.allowedUse.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium text-destructive">Not allowed</p>
          <ul className="mt-1 list-inside list-disc text-muted-foreground">
            {entry.notAllowed.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium text-foreground">License note</p>
          <p className="mt-1 text-muted-foreground">{entry.licenseNote}</p>
        </div>
      </CardContent>
    </Card>
  );
}
