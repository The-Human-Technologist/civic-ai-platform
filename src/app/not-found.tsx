import Link from "next/link";
import { LinkButton } from "@/components/ui/link-button";
import { Shield } from "lucide-react";
import { PLATFORM_NAME } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/30 px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Shield className="size-7" />
      </div>
      <div className="max-w-md">
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This route does not exist in the {PLATFORM_NAME} prototype. Return to the
          landing page or municipal operations dashboard.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <LinkButton href="/">Landing page</LinkButton>
        <LinkButton variant="outline" href="/dashboard">
          Dashboard
        </LinkButton>
      </div>
      <Link href="/pilot-proposal" className="text-sm text-muted-foreground hover:text-foreground">
        View pilot proposal
      </Link>
    </div>
  );
}
