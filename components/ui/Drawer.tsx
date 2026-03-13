"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { Z_INDEX } from "@/constants/ui";

type DrawerSide = "left" | "right";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: DrawerSide;
  className?: string;
}

export function Drawer({
  open,
  onClose,
  children,
  side = "right",
  className,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0" style={{ zIndex: Z_INDEX.DRAWER }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute top-0 h-full w-full max-w-sm overflow-y-auto shadow-xl",
          side === "right" ? "right-0" : "left-0",
          className,
        )}
        style={{ background: "var(--surface-elevated)" }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
