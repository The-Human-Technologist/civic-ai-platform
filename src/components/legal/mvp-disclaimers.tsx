import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DEMO_DATA_NOTICE, MVP_LIMITATIONS } from "@/lib/constants";
import { Info, Shield } from "lucide-react";

export function MvpDisclaimers({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs text-muted-foreground">{DEMO_DATA_NOTICE}</p>
    );
  }

  return (
    <Alert>
      <Shield className="size-4" />
      <AlertTitle>Open-source MVP limitations</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 flex flex-col gap-1.5">
          {MVP_LIMITATIONS.map((item) => (
            <li key={item} className="flex gap-2 text-sm">
              <span className="text-muted-foreground">·</span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-3 flex gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          {DEMO_DATA_NOTICE}
        </p>
      </AlertDescription>
    </Alert>
  );
}
