import Link from "next/link";
import { LinkButton } from "@/components/ui/link-button";
import { PLATFORM_NAME } from "@/lib/constants";
import { Shield } from "lucide-react";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="size-5" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-tight">{PLATFORM_NAME}</p>
            <p className="text-xs text-muted-foreground">Civic Intelligence · Human Review</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#problem" className="hover:text-foreground">Challenge</a>
          <a href="#solution" className="hover:text-foreground">Solution</a>
          <a href="#modules" className="hover:text-foreground">Capabilities</a>
          <a href="#privacy" className="hover:text-foreground">Privacy</a>
          <Link href="/pilot-proposal" className="hover:text-foreground">Pilot Proposal</Link>
        </nav>
        <div className="flex items-center gap-2">
          <LinkButton variant="ghost" size="sm" href="/pilot-proposal">
            Proposal
          </LinkButton>
          <LinkButton variant="ghost" size="sm" href="/dashboard">
            Dashboard
          </LinkButton>
          <LinkButton size="sm" href="/dashboard/upload">
            Start Pilot Demo
          </LinkButton>
        </div>
      </div>
    </header>
  );
}
