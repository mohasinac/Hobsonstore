"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";
import type { Franchise } from "@/types/franchise";

interface FranchiseStripProps {
  franchises: Franchise[];
}

export function FranchiseStrip({ franchises }: FranchiseStripProps) {
  if (franchises.length === 0) return null;

  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });

  function scroll(dir: "left" | "right") {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = trackRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, scrollLeft: el.scrollLeft, moved: false };
    el.setPointerCapture(e.pointerId);
    el.style.cursor = "grabbing";
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.active) return;
    const el = trackRef.current;
    if (!el) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.scrollLeft - dx;
  }

  function onPointerUp() {
    drag.current.active = false;
    const el = trackRef.current;
    if (el) el.style.cursor = "grab";
  }

  return (
    <section
      className="py-6 sm:py-8"
      style={{ background: "var(--card-bg)", borderBottom: "var(--section-border)", overflow: "hidden" }}
    >
      {/* Header — centered with View All on the right */}
      <div className="mx-auto max-w-5xl px-4 mb-7 flex items-center">
        <h2
          className="flex-1 text-center"
          style={{
            fontFamily: "var(--font-bangers, Bangers, cursive)",
            fontSize: "clamp(1.4rem, 3.5vw, 2rem)",
            letterSpacing: "0.1em",
            color: "var(--section-title-color)",
            lineHeight: 1,
          }}
        >
          BROWSE BY FRANCHISE
        </h2>
        <Link
          href={ROUTES.FRANCHISES}
          className="text-xs font-black uppercase tracking-widest shrink-0"
          style={{
            fontFamily: "var(--font-bangers, Bangers, cursive)",
            letterSpacing: "0.1em",
            color: "var(--color-red)",
          }}
        >
          View All →
        </Link>
      </div>

      {/* Scroll track + arrow buttons */}
      <div className="relative mx-auto max-w-5xl">
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="absolute left-0 top-1/2 z-10 hidden sm:flex -translate-y-1/2 items-center justify-center"
          style={{
            width: 36,
            height: 36,
            background: "var(--card-bg)",
            border: "2px solid var(--border-ink)",
            boxShadow: "3px 3px 0px var(--border-ink)",
            color: "var(--section-title-color)",
            fontSize: 18,
            lineHeight: 1,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          ‹
        </button>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="absolute right-0 top-1/2 z-10 hidden sm:flex -translate-y-1/2 items-center justify-center"
          style={{
            width: 36,
            height: 36,
            background: "var(--card-bg)",
            border: "2px solid var(--border-ink)",
            boxShadow: "3px 3px 0px var(--border-ink)",
            color: "var(--section-title-color)",
            fontSize: 18,
            lineHeight: 1,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          ›
        </button>

        {/* Circles — draggable scroll track */}
        <div
          ref={trackRef}
          className="flex gap-5 overflow-x-auto pb-4 scrollbar-none select-none"
          style={{
            cursor: "grab",
            paddingLeft: "clamp(2.5rem, 5vw, 3rem)",
            paddingRight: "clamp(2.5rem, 5vw, 3rem)",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {franchises.map((franchise) => (
            <Link
              key={franchise.slug}
              href={ROUTES.FRANCHISE(franchise.slug)}
              className="group flex shrink-0 flex-col items-center gap-2.5"
              onClick={(e) => { if (drag.current.moved) e.preventDefault(); }}
            >
              <div
                className="relative overflow-hidden rounded-full transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_0_0_3px_rgba(240,196,23,0.4)]"
                style={{
                  width: "clamp(100px, 12vw, 160px)",
                  height: "clamp(100px, 12vw, 160px)",
                  border: "2px solid var(--border-ink)",
                  background: "var(--card-img-bg)",
                  boxShadow: "var(--card-shadow)",
                }}
              >
                {franchise.thumbnailImage && (
                  <Image
                    src={franchise.thumbnailImage}
                    alt={franchise.name}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                )}
              </div>
              <span
                className="text-center text-xs font-bold leading-snug transition-colors group-hover:text-[var(--color-red)]"
                style={{ color: "var(--color-muted)", maxWidth: "clamp(100px, 12vw, 160px)" }}
              >
                {franchise.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

