import { cn } from "@/lib/cn";

export type BadgeVariant = "sale" | "preorder" | "soldout" | "new" | "coin";

const variantClasses: Record<BadgeVariant, string> = {
  sale:     "bg-[#E8001C] text-white border-[#B50016]",
  preorder: "bg-[#FF8C00] text-white border-[#CC7000]",
  soldout:  "bg-[#6B6B6B] text-white border-[#4A4A4A]",
  new:      "bg-[#0057FF] text-white border-[#0040CC]",
  coin:     "bg-[#FFE500] text-[#0D0D0D] border-[#D4BF00]",
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
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
