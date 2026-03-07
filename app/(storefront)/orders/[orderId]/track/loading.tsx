import { Skeleton } from "@/components/ui/Skeleton";

export default function OrderTrackLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        {/* Stepper skeleton */}
        <div className="md:col-span-2">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-5">
            <Skeleton className="h-4 w-20" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary skeleton */}
        <div className="flex flex-col gap-5 md:col-span-3">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
            <Skeleton className="h-4 w-16" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-14 w-14 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
