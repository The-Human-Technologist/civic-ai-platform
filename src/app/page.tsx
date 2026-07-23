import {
  ArrowRight,
  Building2,
  Camera,
  CheckCircle2,
  Eye,
  FileSearch,
  Hospital,
  Landmark,
  School,
  Shield,
  ShieldCheck,
  TrafficCone,
  Users,
  Video,
} from "lucide-react";
import { LandingNav } from "@/components/layout/landing-nav";
import { LandingFooter } from "@/components/layout/landing-footer";
import { LinkButton } from "@/components/ui/link-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DISCLAIMER, PILOT_CORRIDOR, PILOT_SUBTITLE } from "@/lib/constants";

const DETECTION_MODULES = [
  { title: "Illegal Parking", icon: TrafficCone },
  { title: "Wrong-Way Driving", icon: ArrowRight },
  { title: "Helmet Compliance", icon: Shield },
  { title: "Speed Estimation", icon: Eye },
  { title: "Accident / Near-Miss", icon: FileSearch },
  { title: "Potholes & Road Damage", icon: TrafficCone },
  { title: "Garbage Overflow", icon: Building2 },
  { title: "Waterlogging", icon: Landmark },
  { title: "Road Blockage", icon: Camera },
  { title: "Traffic Congestion", icon: Users },
];

const AUDIENCES = [
  "Municipalities",
  "Police & traffic units",
  "Transport departments",
  "Smart city programs",
  "Gated communities",
  "Hospitals",
  "School zones",
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <Badge variant="secondary" className="mb-4">
              North 24 Parganas · Barasat Municipality Pilot
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              AI Civic &amp; Road Safety Intelligence
            </h1>
            <p className="mt-2 text-sm font-medium text-primary">{PILOT_SUBTITLE}</p>
            <p className="mt-4 text-lg text-muted-foreground">
              A privacy-first analytics platform for{" "}
              <strong className="font-medium text-foreground">West Bengal municipalities and traffic departments</strong>.
              Evaluate a privacy-first workflow for turning authorized footage into human-reviewed
              civic and road-safety alerts. The public alpha uses synthetic detections; real footage
              processing is not enabled yet.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton size="lg" href="/pilot-proposal">
                Read Pilot Proposal <ArrowRight className="size-4" data-icon="inline-end" />
              </LinkButton>
              <LinkButton size="lg" variant="outline" href="/dashboard">
                Live Dashboard Demo
              </LinkButton>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {PILOT_CORRIDOR} · No facial recognition · No automatic challan
            </p>
          </div>
          <Card className="border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Video className="size-5 text-primary" />
                Live pilot snapshot
              </CardTitle>
              <CardDescription>Illustrative dashboard metrics</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {[
                ["Detections today", "14"],
                ["Pending review", "16"],
                ["Confirmed", "13"],
                ["Pilot hotspots", "5"],
              ].map(([label, val]) => (
                <div key={label} className="rounded-lg border bg-muted/40 p-4">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-2xl font-bold">{val}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">The problem</h2>
          <p className="mt-4 text-muted-foreground">
            Cities already record thousands of hours of CCTV footage, but most of it is never
            analyzed for civic issues or road safety patterns. Manual monitoring does not scale.
            Officials need structured, reviewable intelligence — not another black-box surveillance
            system.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Footage sits unused",
              text: "Existing cameras capture incidents that are never flagged for action.",
            },
            {
              title: "Reactive civic response",
              text: "Potholes, waterlogging, and blockages are reported only after complaints.",
            },
            {
              title: "Road safety blind spots",
              text: "Near-misses and risky behaviour patterns are rarely documented systematically.",
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Solution */}
      <section id="solution" className="border-y bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">The solution</h2>
            <p className="mt-4 text-muted-foreground">
              An open-source civic intelligence workflow designed for authorized municipal video.
              The current alpha demonstrates detections and routes everything through{" "}
              <strong className="font-medium text-foreground">mandatory human review</strong> before
              any field action or report.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Camera, title: "Authorized inputs", text: "Synthetic demos today; controlled uploaded footage is the first pilot target." },
              { icon: ShieldCheck, title: "Human review first", text: "Every alert confirmed or rejected by officials." },
              { icon: FileSearch, title: "Review records", text: "Timestamped mock detections demonstrate the future evidence-review flow." },
              { icon: Eye, title: "Privacy-first", text: "No facial recognition; masking must happen before pilot evidence is stored." },
            ].map(({ icon: Icon, title, text }) => (
              <Card key={title}>
                <CardHeader>
                  <Icon className="size-8 text-primary" />
                  <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Detection modules */}
      <section id="modules" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Detection modules</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Planned road-safety and civic detection capabilities, represented by synthetic outputs in
          the public alpha. Every output remains an estimate pending human verification.
        </p>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DETECTION_MODULES.map(({ title, icon: Icon }) => (
            <div
              key={title}
              className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm"
            >
              <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <span className="text-sm font-medium">{title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How it works</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              ["Choose a safe input", "Use synthetic scenarios now; authorized uploaded clips are planned for a controlled pilot."],
              ["Generate detections", "Mock AI currently produces confidence-scored events; evaluated CV models come later."],
              ["Human review", "Officials confirm, reject, or mark for field verification."],
              ["Reports & action", "Generate pilot reports and evidence packs for departments."],
            ].map(([title, text], i) => (
              <li key={title} className="relative">
                <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pilot plan */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">30-day pilot plan</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Designed for a Barasat / North 24 Parganas demonstration to municipalities, police,
          transport departments, and smart city stakeholders.
        </p>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {[
            { week: "Week 1", tasks: "Feed onboarding, privacy settings, reviewer training" },
            { week: "Week 2–3", tasks: "Daily review workflow, hotspot mapping, false-positive tuning" },
            { week: "Week 4", tasks: "Pilot report, intervention recommendations, scale roadmap" },
          ].map((phase) => (
            <Card key={phase.week}>
              <CardHeader>
                <CardTitle className="text-base">{phase.week}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{phase.tasks}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {AUDIENCES.map((a) => (
            <Badge key={a} variant="outline" className="gap-1.5 py-1.5">
              {a.includes("School") ? <School className="size-3" /> : null}
              {a.includes("Hospital") ? <Hospital className="size-3" /> : null}
              {a}
            </Badge>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Privacy &amp; safety</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              "No facial recognition enabled by default",
              "Face blurring required before future evidence persistence (pipeline integration planned)",
              "Number plate masking required for future pilot evidence",
              "30-day intake retention default (automatic deletion planned)",
              "Immutable server audit logs planned; demo review metadata stays local",
              "Human review required before any external action",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
          <Alert className="mt-8">
            <Shield className="size-4" />
            <AlertTitle>Important positioning</AlertTitle>
            <AlertDescription>{DISCLAIMER}</AlertDescription>
          </Alert>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Ready to explore the pilot demo?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Upload sample footage or use Barasat demo feeds. Review detections in the dashboard and
          generate a printable pilot report.
        </p>
        <LinkButton size="lg" className="mt-8" href="/pilot-proposal">
          View 30-Day Pilot Proposal <ArrowRight className="size-4" data-icon="inline-end" />
        </LinkButton>
      </section>

      <LandingFooter />
    </div>
  );
}
