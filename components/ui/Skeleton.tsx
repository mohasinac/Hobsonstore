import { cn } from "@/lib/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded", className)}
      style={{ background: 'var(--skeleton-bg)' }}
      aria-hidden="true"
    />
  );
}
