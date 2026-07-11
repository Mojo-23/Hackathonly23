import { Skeleton } from "@/components/ui/skeleton";

export default function EventsLoading() {
  return (
    <div className="bg-background-default">
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-3 h-9 w-full max-w-sm" />
        <Skeleton className="mt-3 h-5 w-full max-w-2xl" />
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-card border border-border-default bg-background-default"
            >
              <Skeleton className="h-32 w-full" />
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-28 rounded-pill" />
                </div>
                <Skeleton className="mt-5 h-6 w-11/12" />
                <div className="mt-5 space-y-3 border-t border-border-default pt-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="mt-5 h-6 w-28 rounded-pill" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
