"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <AlertTriangle className="size-8 text-status-danger-fg" strokeWidth={1.5} />
      <p className="text-sm font-medium text-ink">Something went wrong.</p>
      <p className="max-w-sm text-sm text-ink-muted">{error.message || "An unexpected error occurred."}</p>
      <Button onClick={() => reset()} size="sm" className="mt-2">
        Try again
      </Button>
    </div>
  );
}
