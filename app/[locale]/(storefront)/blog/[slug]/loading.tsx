import { Skeleton } from "@/components/ui/Skeleton";

export default function BlogPostLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Skeleton className="mb-4 h-4 w-24" />
      <Skeleton className="mb-6 aspect-[16/9] w-full rounded-xl" />
      <div className="mb-3 flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="mb-2 h-8 w-full" />
      <Skeleton className="mb-6 h-4 w-1/3" />
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
