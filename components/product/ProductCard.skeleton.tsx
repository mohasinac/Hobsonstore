import { Skeleton } from "@/components/ui/Skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden bg-white" style={{ border: '2px solid #0D0D0D', boxShadow: '3px 3px 0px #0D0D0D' }}>
      <Skeleton className="aspect-square w-full" />
      <div className="flex flex-col gap-2 p-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
}
