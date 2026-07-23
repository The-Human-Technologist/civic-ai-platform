"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application route error", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center gap-4 px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Recovery</p>
      <h1 className="text-3xl font-bold tracking-tight">This view could not be loaded.</h1>
      <p className="text-muted-foreground">
        No footage or enforcement action was triggered. Retry the view, or return to the dashboard.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
