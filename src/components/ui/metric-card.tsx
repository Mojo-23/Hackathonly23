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
  warning: "border-status-warning-fg/40",
  danger: "border-status-error-fg/40",
};

export function MetricCard({ label, value, icon: Icon, hint, tone = "neutral", className }: MetricCardProps) {
  return (
    <Card className={cn("p-6", toneRing[tone], className)}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-label font-medium uppercase tracking-label text-text-tertiary">
          {label}
        </span>
        {Icon ? <Icon className="size-4 text-text-tertiary" strokeWidth={1.75} /> : null}
      </div>
      <div className="mt-2 text-metric font-semibold tabular-nums text-text-primary">{value}</div>
      {hint ? <p className="mt-1 text-label text-text-secondary">{hint}</p> : null}
    </Card>
  );
}
