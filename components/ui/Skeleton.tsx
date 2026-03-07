import { cn } from "@/lib/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded", className)}
      style={{ background: '#E5E5D8' }}
      aria-hidden="true"
    />
  );
}
