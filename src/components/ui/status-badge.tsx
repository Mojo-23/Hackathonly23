import { cn } from "@/lib/utils";

export type StatusTone = "pending" | "success" | "danger" | "info" | "neutral";

const toneClasses: Record<StatusTone, string> = {
  pending: "bg-status-warning-tint text-status-warning-fg",
  success: "bg-status-success-tint text-status-success-fg",
  danger: "bg-status-error-tint text-status-error-fg",
  info: "bg-status-info-tint text-status-info-fg",
  neutral: "bg-status-neutral-tint text-status-neutral-fg",
};

// Central mapping so every status string in the product renders identically.
// Extend this map rather than styling a status badge ad hoc anywhere else.
const knownStatusTones: Record<string, StatusTone> = {
  draft: "neutral",
  published: "info",
  registration_open: "success",
  registration_closed: "neutral",
  live: "success",
  judging: "pending",
  completed: "neutral",
  archived: "neutral",
  pending: "pending",
  accepted: "success",
  waitlisted: "pending",
  rejected: "danger",
  cancelled: "neutral",
  declined: "danger",
  open: "info",
  assigned: "pending",
  resolved: "success",
  in_person: "info",
  online: "info",
  hybrid: "info",
};

export interface StatusBadgeProps {
  status: string;
  label?: string;
  tone?: StatusTone;
  className?: string;
}

export function StatusBadge({ status, label, tone, className }: StatusBadgeProps) {
  const resolvedTone = tone ?? knownStatusTones[status] ?? "neutral";
  const text = label ?? status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-1 text-label font-medium capitalize",
        toneClasses[resolvedTone],
        className,
      )}
    >
      {text}
    </span>
  );
}
