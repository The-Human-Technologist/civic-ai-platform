"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button size="lg" variant="outline" onClick={() => window.print()}>
      <Printer className="size-4" data-icon="inline-start" />
      Print proposal
    </Button>
  );
}
