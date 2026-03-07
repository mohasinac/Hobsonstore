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
      className="py-2 text-center text-xs font-medium"
      style={{
        backgroundColor: current.bgColor ?? "#1a1a1a",
        color: current.textColor ?? "#ffffff",
      }}
    >
      {current.link ? (
        <Link href={current.link} className="hover:underline">
          {current.message}
          {current.linkLabel && ` — ${current.linkLabel}`}
        </Link>
      ) : (
        <span>{current.message}</span>
      )}
    </div>
  );
}
