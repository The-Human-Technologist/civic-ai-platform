import Link from "next/link";
import { PLATFORM_NAME } from "@/lib/constants";

const GITHUB_REPO = "https://github.com/The-Human-Technologist/civic-ai-platform";

export function LandingFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md">
          <p className="font-semibold">{PLATFORM_NAME}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Open-source civic operations &amp; road safety analytics. Privacy-first video
            intelligence with human-reviewed alerts — not a surveillance system.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            AGPL-3.0 · Real authorized-video inference · No automatic fines · No facial recognition
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="font-medium text-foreground">Product</span>
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <Link href="/pilot-proposal" className="hover:text-foreground">Pilot Proposal</Link>
            <Link href="/dashboard/demo-footage" className="hover:text-foreground">Sample Footage</Link>
            <Link href="/dashboard/upload" className="hover:text-foreground">Analyze footage</Link>
            <a href="https://civic-ai-platform-three.vercel.app" className="hover:text-foreground" rel="noopener noreferrer" target="_blank">Hosted prototype</a>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-medium text-foreground">Open source</span>
            <a href={GITHUB_REPO} className="hover:text-foreground" rel="noopener noreferrer" target="_blank">GitHub</a>
            <a href={`${GITHUB_REPO}/blob/master/PRIVACY.md`} className="hover:text-foreground" rel="noopener noreferrer" target="_blank">Privacy</a>
            <a href={`${GITHUB_REPO}/blob/master/ROADMAP.md`} className="hover:text-foreground" rel="noopener noreferrer" target="_blank">Roadmap</a>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-medium text-foreground">Contribute</span>
            <a href={`${GITHUB_REPO}/blob/master/CONTRIBUTING.md`} className="hover:text-foreground" rel="noopener noreferrer" target="_blank">Contributing</a>
            <a href={`${GITHUB_REPO}/blob/master/SECURITY.md`} className="hover:text-foreground" rel="noopener noreferrer" target="_blank">Security</a>
            <a href={`${GITHUB_REPO}/issues`} className="hover:text-foreground" rel="noopener noreferrer" target="_blank">Issues</a>
          </div>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © 2026 Civic AI Platform Contributors · Real and synthetic sources are labeled · Not affiliated with any government unless stated by deployer
      </div>
    </footer>
  );
}
