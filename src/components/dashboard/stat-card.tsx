import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accent?: "default" | "warning" | "success" | "danger";
  className?: string;
}

const accentStyles = {
  default: "bg-primary/10 text-primary",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  danger: "bg-red-500/15 text-red-700 dark:text-red-400",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "default",
  className,
}: StatCardProps) {
  return (
    <Card className={cn("border shadow-sm transition-shadow hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("flex size-9 items-center justify-center rounded-lg", accentStyles[accent])}>
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tracking-tight tabular-nums">{value}</p>
        {subtitle ? (
          <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{subtitle}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
