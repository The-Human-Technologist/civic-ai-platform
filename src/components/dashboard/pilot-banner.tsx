import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { PILOT_CORRIDOR, PILOT_SUBTITLE, PILOT_TITLE } from "@/lib/constants";
import { PILOT_CAMERAS_TOTAL, PILOT_WARDS } from "@/lib/data/locations";
import { FileText, MapPin } from "lucide-react";

export function DashboardPilotBanner() {
  return (
    <div className="overflow-hidden rounded-xl border bg-gradient-to-r from-primary via-primary/95 to-primary/85 text-primary-foreground shadow-md">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-white/20 bg-white/15 text-primary-foreground hover:bg-white/15">
              Live Pilot Demo
            </Badge>
            <Badge variant="outline" className="border-white/30 text-primary-foreground">
              WB-N24-BRS-2026
            </Badge>
          </div>
          <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">{PILOT_TITLE}</h2>
          <p className="mt-1 text-sm text-primary-foreground/85">{PILOT_SUBTITLE}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-primary-foreground/75">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {PILOT_CORRIDOR}
            </span>
            <span>·</span>
            <span>{PILOT_WARDS.join(", ")}</span>
            <span>·</span>
            <span>{PILOT_CAMERAS_TOTAL} CCTV feeds inventoried</span>
          </p>
        </div>
        <LinkButton
          variant="secondary"
          size="sm"
          href="/pilot-proposal"
          className="shrink-0 bg-white text-primary hover:bg-white/90"
        >
          <FileText className="size-4" data-icon="inline-start" />
          Pilot Proposal
        </LinkButton>
      </div>
    </div>
  );
}
