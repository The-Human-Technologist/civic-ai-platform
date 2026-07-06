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

export default function SettingsPage() {
  const { settings, updateSettings, resetDemoData, hydrated } = useEventStore();

  if (!hydrated) return <DashboardLoading />;

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Privacy &amp; Settings</h1>
        <p className="text-sm text-muted-foreground">
          Privacy-first configuration for municipal civic intelligence (open-source MVP)
        </p>
      </div>

      <MvpDisclaimers />

      <Alert>
        <Shield className="size-4" />
        <AlertTitle>Not a surveillance system</AlertTitle>
        <AlertDescription>{DISCLAIMER}</AlertDescription>
      </Alert>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Privacy controls</CardTitle>
          <CardDescription>MVP toggles — production would enforce server-side</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {[
            {
              id: "face",
              label: "Face blurring (planned)",
              desc: "Auto-blur faces in evidence clips before export",
              key: "faceBlurringPlanned" as const,
            },
            {
              id: "plate",
              label: "Number plate masking",
              desc: "Mask plates in non-enforcement / advisory mode",
              key: "numberPlateMasking" as const,
            },
            {
              id: "audit",
              label: "Audit logs",
              desc: "Log all review actions with timestamp and reviewer ID",
              key: "auditLogsEnabled" as const,
            },
            {
              id: "human",
              label: "Human review required",
              desc: "Block field dispatch until official confirms event",
              key: "humanReviewRequired" as const,
            },
            {
              id: "fr",
              label: "Facial recognition disabled",
              desc: "No biometric identification — locked off by default",
              key: "facialRecognitionDisabled" as const,
            },
            {
              id: "rbac",
              label: "Role-based access (planned)",
              desc: "Separate roles for viewer, reviewer, and admin",
              key: "roleBasedAccessPlanned" as const,
            },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor={item.id} className="text-sm font-medium">
                  {item.label}
                </Label>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                id={item.id}
                checked={settings[item.key]}
                onCheckedChange={(v) => {
                  updateSettings({ [item.key]: v });
                  toast.success("Setting updated");
                }}
                disabled={item.key === "facialRecognitionDisabled"}
              />
            </div>
          ))}

          <Separator />

          <div className="flex flex-col gap-2">
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
              className="max-w-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              Evidence clips auto-purged after retention window (production cron job)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Demo data</CardTitle>
          <CardDescription>Reset local pilot dataset to seed values</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
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

      <p className="text-xs text-muted-foreground">
        {/* REAL INTEGRATION: Settings API + PostgreSQL + IAM roles */}
        Production: persist settings per organization, enforce retention via object lifecycle rules.
      </p>
    </div>
  );
}
