"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Announcement } from "@/types/content";

interface AnnouncementBarProps {
  announcements: Announcement[];
}

export function AnnouncementBar({ announcements }: AnnouncementBarProps) {
  const active = announcements.filter((a) => a.active);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (active.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % active.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [active.length]);

  if (active.length === 0) return null;

  const current = active[index]!;

  return (
    <div
      className="py-1.5 text-center text-xs font-bold tracking-wide"
      style={{
        backgroundColor: current.bgColor ?? "#E8001C",
        color: current.textColor ?? "#FFFFFF",
        borderBottom: "2px solid #0D0D0D",
        fontFamily: "var(--font-inter, Inter, sans-serif)",
        letterSpacing: "0.05em",
      }}
    >
      {current.link ? (
        <Link href={current.link} className="hover:underline">
          {current.message}
          {current.linkLabel && (
            <span className="ml-2 font-black underline">{current.linkLabel} →</span>
          )}
        </Link>
      ) : (
        <span>{current.message}</span>
      )}
    </div>
  );
}
