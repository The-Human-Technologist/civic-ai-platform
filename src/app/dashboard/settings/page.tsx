"use client";

import { toast } from "sonner";
import { Shield, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useEventStore } from "@/lib/data/event-store";
import { DISCLAIMER } from "@/lib/constants";
import { MvpDisclaimers } from "@/components/legal/mvp-disclaimers";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";

const PRIVACY_CONTROLS = [
  {
    id: "face",
    label: "Face blurring (planned)",
    desc: "Auto-blur faces in evidence clips before export",
    key: "faceBlurringPlanned" as const,
  },
  {
    id: "plate",
    label: "Number plate masking (pilot requirement)",
    desc: "Locked on for future authorized-footage evidence",
    key: "numberPlateMasking" as const,
    disabled: true,
  },
  {
    id: "audit",
    label: "Audit logs (planned)",
    desc: "Demo review metadata is local; immutable server audit is not shipped",
    key: "auditLogsEnabled" as const,
  },
  {
    id: "human",
    label: "Human review required",
    desc: "Locked on: no external action without an official reviewer",
    key: "humanReviewRequired" as const,
    disabled: true,
  },
  {
    id: "fr",
    label: "Facial recognition disabled",
    desc: "No biometric identification — locked off by default",
    key: "facialRecognitionDisabled" as const,
    disabled: true,
  },
  {
    id: "rbac",
    label: "Role-based access (planned)",
    desc: "Separate roles for viewer, reviewer, and admin",
    key: "roleBasedAccessPlanned" as const,
  },
] as const;

export default function SettingsPage() {
  const { settings, updateSettings, resetDemoData, hydrated } = useEventStore();

  if (!hydrated) return <DashboardLoading />;

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Privacy &amp; Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Privacy-first configuration for municipal civic intelligence (open-source MVP)
        </p>
      </div>

      <div className="grid w-full gap-6 xl:grid-cols-2">
        <div className="flex flex-col gap-6">
          <MvpDisclaimers />
          <Alert>
            <Shield className="size-4" />
            <AlertTitle>Not a surveillance system</AlertTitle>
            <AlertDescription>{DISCLAIMER}</AlertDescription>
          </Alert>
        </div>

        <Card className="shadow-sm xl:row-span-2">
          <CardHeader>
            <CardTitle className="text-base">Privacy controls</CardTitle>
            <CardDescription>MVP toggles — production would enforce server-side</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="grid gap-5 sm:grid-cols-2">
              {PRIVACY_CONTROLS.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 rounded-lg border bg-muted/20 p-4"
                >
                  <div className="min-w-0 flex-1 flex-col gap-0.5">
                    <Label htmlFor={item.id} className="text-sm font-medium leading-snug">
                      {item.label}
                    </Label>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    id={item.id}
                    className="shrink-0"
                    checked={settings[item.key]}
                    onCheckedChange={(v) => {
                      updateSettings({ [item.key]: v });
                      toast.success("Setting updated");
                    }}
                    disabled={"disabled" in item && item.disabled}
                  />
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex flex-col gap-2 sm:max-w-xs">
              <Label htmlFor="retention">Data retention period (days)</Label>
              <Input
                id="retention"
                type="number"
                min={7}
                max={365}
                value={settings.dataRetentionDays}
                onChange={(e) =>
                  updateSettings({ dataRetentionDays: Number(e.target.value) || 30 })
                }
                className="w-full max-w-[140px]"
              />
              <p className="text-xs text-muted-foreground">
                Demo setting only. Production requires tested object-lifecycle deletion.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Demo data</CardTitle>
            <CardDescription>Reset local pilot dataset to seed values</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Clears locally stored detections and restores the Barasat pilot seed dataset.
            </p>
            <Button
              variant="outline"
              className="shrink-0"
              onClick={() => {
                resetDemoData();
                toast.success("Demo data reset");
              }}
            >
              <RotateCcw className="size-4" data-icon="inline-start" />
              Reset demo events
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Production: persist settings per organization, enforce retention via object lifecycle rules.
      </p>
    </div>
  );
}
