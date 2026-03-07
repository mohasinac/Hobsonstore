import { cn } from "@/lib/cn";

export type BadgeVariant = "sale" | "preorder" | "soldout" | "new" | "coin";

const variantClasses: Record<BadgeVariant, string> = {
  sale: "bg-red-600 text-white",
  preorder: "bg-amber-500 text-white",
  soldout: "bg-gray-400 text-white",
  new: "bg-emerald-600 text-white",
  coin: "bg-yellow-400 text-yellow-900",
};

interface BadgeProps {
  variant: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
