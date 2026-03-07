"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#E8001C] text-white hover:bg-[#B50016] active:bg-[#8C0012] disabled:bg-red-300",
  secondary:
    "bg-white text-[#0D0D0D] border-2 border-[#0D0D0D] hover:bg-[#FFFEF0] active:bg-gray-100 disabled:opacity-50",
  ghost:
    "bg-transparent text-[#0D0D0D] hover:bg-[#FFE500]/30 active:bg-[#FFE500]/50 disabled:opacity-50",
  danger:
    "bg-red-50 text-red-700 border-2 border-red-200 hover:bg-red-100 disabled:opacity-50",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      loading = false,
      fullWidth = false,
      size = "md",
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001C] focus-visible:ring-offset-2",
        "border-2 border-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D] hover:-translate-y-px hover:shadow-[4px_4px_0px_#0D0D0D] active:translate-y-px active:shadow-[1px_1px_0px_#0D0D0D]",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        variantClasses[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
