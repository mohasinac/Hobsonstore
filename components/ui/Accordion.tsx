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
    <div
      className={cn(
        "divide-y divide-gray-200 border-y border-gray-200",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.id}>
          <button
            className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-gray-900 hover:text-red-600"
            onClick={() => setOpenId(openId === item.id ? null : item.id)}
            aria-expanded={openId === item.id}
          >
            {item.question}
            <span className="ml-4 text-lg leading-none">
              {openId === item.id ? "−" : "+"}
            </span>
          </button>
          {openId === item.id && (
            <div className="pb-4 text-sm text-gray-600">{item.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}
