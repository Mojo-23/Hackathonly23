import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  tone?: "neutral" | "warning" | "danger";
  className?: string;
}

const toneRing: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  neutral: "",
  warning: "border-status-pending-fg/40",
  danger: "border-status-danger-fg/40",
};

export function MetricCard({ label, value, icon: Icon, hint, tone = "neutral", className }: MetricCardProps) {
  return (
    <Card className={cn("p-5", toneRing[tone], className)}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
          {label}
        </span>
        {Icon ? <Icon className="size-4 text-ink-subtle" strokeWidth={1.75} /> : null}
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums text-ink">{value}</div>
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
    </Card>
  );
}
