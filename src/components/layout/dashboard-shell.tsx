"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  List,
  Map,
  FileText,
  Settings,
  Shield,
  Menu,
  ScrollText,
  Database,
  Film,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PILOT_SUBTITLE, PLATFORM_NAME } from "@/lib/constants";
import { LinkButton } from "@/components/ui/link-button";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/upload", label: "Video & Feeds", icon: Upload },
  { href: "/dashboard/data-sources", label: "Data Sources", icon: Database },
  { href: "/dashboard/demo-footage", label: "Demo Footage", icon: Film },
  { href: "/dashboard/events", label: "Detections", icon: List },
  { href: "/dashboard/map", label: "Hotspots", icon: Map },
  { href: "/dashboard/reports", label: "Pilot Report", icon: FileText },
  { href: "/pilot-proposal", label: "Proposal", icon: ScrollText },
  { href: "/dashboard/settings", label: "Privacy", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="dashboard-sidebar hidden w-64 shrink-0 flex-col border-r bg-background lg:flex">
        <div className="flex items-center gap-2.5 border-b px-5 py-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Civic Intelligence</p>
            <p className="text-xs text-muted-foreground">Barasat · N24 Parganas</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <NavLinks />
          <Separator />
          <div className="rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Human review required</p>
            <p className="mt-1">All AI detections await municipal or traffic authority confirmation. No automatic challan.</p>
          </div>
        </div>
        <div className="border-t p-4 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">{PLATFORM_NAME}</Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="dashboard-topbar flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger
                className="lg:hidden"
                render={
                  <Button variant="outline" size="icon">
                    <Menu className="size-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                }
              />
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="border-b px-5 py-5">
                  <p className="font-semibold">Civic Intelligence</p>
                  <p className="text-xs text-muted-foreground">Barasat Pilot Dashboard</p>
                </div>
                <div className="p-4">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
            <div>
              <p className="text-sm font-medium">Barasat Municipality Pilot</p>
              <p className="text-xs text-muted-foreground">{PILOT_SUBTITLE}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LinkButton variant="outline" size="sm" href="/pilot-proposal">
              Proposal
            </LinkButton>
            <LinkButton variant="outline" size="sm" href="/">
              Public site
            </LinkButton>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
