"use client";

import Link from "next/link";
import type { Announcement } from "@/types/content";

interface AnnouncementBarProps {
  announcements: Announcement[];
  /** When true the bar renders without background/border, text inherits --nb-text from parent */
  transparent?: boolean;
}

// Separator bullet between messages
const SEP = (
  <span
    className="mx-8 inline-block select-none opacity-50"
    aria-hidden="true"
    style={{ fontSize: "0.5rem", verticalAlign: "middle" }}
  >
    ◆
  </span>
);

export function AnnouncementBar({ announcements, transparent = false }: AnnouncementBarProps) {
  const active = announcements.filter((a) => a.active);
  if (active.length === 0) return null;

  // Use the first announcement's colours for the bar background
  const first = active[0]!;
  const bgColor = first.bgColor ?? "#E8001C";
  const textColor = first.textColor ?? "#FFFFFF";

  // Duplicate the list so the marquee loops seamlessly (we duplicate once,
  // then animate exactly -50% — the two halves are identical)
  const items = [...active, ...active];

  return (
    <div
      className="overflow-hidden"
      style={{
        backgroundColor: transparent ? "transparent" : bgColor,
        color: transparent ? "var(--nb-text)" : textColor,
        borderBottom: transparent ? "none" : "2px solid var(--border-ink)",
        height: "var(--announcement-height, 36px)",
        transition: "background-color 0.35s ease, color 0.35s ease, border-color 0.35s ease",
      }}
      aria-label="Announcements"
    >
      {/* marquee-track pauses on hover via CSS */}
      <div className="marquee-track flex items-center h-full px-6 sm:px-8">
        <div className="animate-marquee items-center text-xs font-black tracking-wide" style={{ letterSpacing: "0.07em" }}>
          {items.map((ann, i) => (
            <span key={i} className="inline-flex items-center whitespace-nowrap">
              {ann.link ? (
                <Link href={ann.link} className="hover:underline inline-flex items-center gap-1.5">
                  {ann.message}
                  {ann.linkLabel && (
                    <span className="font-black underline">{ann.linkLabel} →</span>
                  )}
                </Link>
              ) : (
                <span>{ann.message}</span>
              )}
              {SEP}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
