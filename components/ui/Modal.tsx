"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { Z_INDEX } from "@/constants/ui";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  title?: string;
}

export function Modal({
  open,
  onClose,
  children,
  className,
  title,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

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
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: Z_INDEX.MODAL }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative w-full max-w-lg p-6",
          className,
        )}
        style={{ background: "var(--surface-elevated)", border: "2px solid var(--border-ink)", boxShadow: "4px 4px 0px var(--border-ink)" }}
      >
        {title && (
          <h2 className="mb-4 text-lg font-bold" style={{ fontFamily: 'var(--font-bangers)', color: 'var(--color-black)', letterSpacing: '0.06em' }}>{title}</h2>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
