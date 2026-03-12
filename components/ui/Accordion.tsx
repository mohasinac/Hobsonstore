"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface AccordionItem {
  id: string;
  question: string;
  answer: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export function Accordion({ items, className }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            border: "2px solid var(--color-yellow)",
            background: openId === item.id ? "var(--dark-section-card)" : "var(--dark-section-alt)",
          }}
        >
          <button
            className="flex w-full items-center justify-between px-5 py-4 text-left font-bold transition-colors"
            style={{
              color: openId === item.id ? "var(--color-yellow)" : "#FFFFFF",
              background: "transparent",
              fontSize: "0.9rem",
              letterSpacing: "0.02em",
            }}
            onClick={() => setOpenId(openId === item.id ? null : item.id)}
            aria-expanded={openId === item.id}
          >
            {item.question}
            <span
              className="ml-4 shrink-0 text-xl font-black leading-none"
              style={{ color: "var(--color-yellow)" }}
            >
              {openId === item.id ? "−" : "+"}
            </span>
          </button>
          {openId === item.id && (
            <div
              className="px-5 pb-4 text-sm leading-relaxed"
              style={{ color: "var(--dark-section-text)", borderTop: "1px solid var(--dark-section-inner-border)" }}
            >
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
