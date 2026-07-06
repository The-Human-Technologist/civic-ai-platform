import Link from "next/link";
import { LinkButton } from "@/components/ui/link-button";
import { PLATFORM_NAME } from "@/lib/constants";
import { Shield } from "lucide-react";

const HOME_NAV = [
  { href: "#problem", label: "Challenge" },
  { href: "#solution", label: "Solution" },
  { href: "#modules", label: "Capabilities" },
  { href: "#privacy", label: "Privacy" },
] as const;

const PROPOSAL_NAV = [
  { href: "#objective", label: "Objective" },
  { href: "#scope", label: "Scope" },
  { href: "#challenges", label: "Challenges" },
  { href: "#timeline", label: "Timeline" },
  { href: "#privacy", label: "Privacy" },
  { href: "#outcomes", label: "Outcomes" },
  { href: "#security", label: "Security" },
] as const;

type LandingNavProps = {
  variant?: "home" | "proposal";
};

export function LandingNav({ variant = "home" }: LandingNavProps) {
  const sectionLinks = variant === "proposal" ? PROPOSAL_NAV : HOME_NAV;

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
        <nav className="hidden items-center gap-5 text-sm text-muted-foreground lg:flex">
          {sectionLinks.map(({ href, label }) => (
            <a key={href} href={href} className="hover:text-foreground">
              {label}
            </a>
          ))}
          {variant === "home" ? (
            <Link href="/pilot-proposal" className="hover:text-foreground">
              Pilot Proposal
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          {variant === "home" ? (
            <LinkButton variant="ghost" size="sm" href="/pilot-proposal">
              Proposal
            </LinkButton>
          ) : null}
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
