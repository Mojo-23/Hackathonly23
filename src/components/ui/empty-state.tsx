import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border-default px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? <Icon className="mb-2 size-7 text-text-tertiary" strokeWidth={1.75} /> : null}
      <p className="text-body-sm font-medium text-text-primary">{title}</p>
      {description ? <p className="max-w-sm text-body-sm text-text-secondary">{description}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
