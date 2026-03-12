import { cn } from "@/lib/cn";
import type { CSSProperties } from "react";

export type BadgeVariant = "sale" | "preorder" | "soldout" | "new" | "coin";

const variantStyles: Record<BadgeVariant, CSSProperties> = {
  sale:     { background: "var(--color-red)",    color: "#fff" },
  preorder: { background: "#FF8C00",              color: "#fff", borderColor: "#CC7000" },
  soldout:  { background: "var(--color-muted)",  color: "#fff" },
  new:      { background: "var(--color-blue)",   color: "#fff" },
  coin:     { background: "var(--color-yellow)", color: "var(--border-ink)" },
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
        "inline-flex items-center px-1.5 py-0.5 text-xs font-black uppercase tracking-wide",
        "border-2",
        className,
      )}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  );
}
