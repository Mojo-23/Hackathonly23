import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { CalendarX } from "lucide-react";

export default function EventNotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <EmptyState
        icon={CalendarX}
        title="Event not found"
        description="This hackathon doesn't exist or is no longer published."
        action={
          <Link href="/events" className={buttonVariants({ size: "sm" })}>
            Browse events
          </Link>
        }
      />
    </div>
  );
}
