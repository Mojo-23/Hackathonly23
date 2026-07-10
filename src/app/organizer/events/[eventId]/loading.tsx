import { Skeleton } from "@/components/ui/skeleton";

export default function CommandCenterLoading() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-9 w-64" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );
}
