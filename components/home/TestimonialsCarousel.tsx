"use client";

import { useState } from "react";
import { StarRating } from "@/components/ui/StarRating";
import type { Testimonial } from "@/types/content";

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

export function TestimonialsCarousel({
  testimonials,
}: TestimonialsCarouselProps) {
  const [start, setStart] = useState(0);
  const perPage = 3;

  if (testimonials.length === 0) return null;

  const visible = testimonials.slice(start, start + perPage);
  const canPrev = start > 0;
  const canNext = start + perPage < testimonials.length;

  return (
    <section
      className="py-14"
      style={{
        background: "#FFFEF0",
        borderTop: "3px solid #0D0D0D",
        borderBottom: "3px solid #0D0D0D",
      }}
    >
      <div className="mx-auto max-w-7xl px-4">
        <h2
          className="mb-8 text-center"
          style={{
            fontFamily: "var(--font-bangers, Bangers, cursive)",
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            letterSpacing: "0.08em",
            color: "#0D0D0D",
          }}
        >
          WHAT OUR COLLECTORS SAY
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((t) => (
            <div
              key={t.id}
              className="flex flex-col gap-3 p-6"
              style={{
                background: "#FFFFFF",
                border: "3px solid #0D0D0D",
                boxShadow: "4px 4px 0px #0D0D0D",
              }}
            >
              <StarRating rating={t.rating} />
              <p
                className="flex-1 text-sm leading-relaxed"
                style={{ color: "#1A1A2E" }}
              >
                &ldquo;{t.text}&rdquo;
              </p>
              <p
                className="text-xs font-black uppercase"
                style={{ color: "#E8001C", letterSpacing: "0.06em" }}
              >
                — {t.name}
              </p>
            </div>
          ))}
        </div>

        {testimonials.length > perPage && (
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => setStart((s) => Math.max(0, s - perPage))}
              disabled={!canPrev}
              className="px-5 py-2 text-sm font-black uppercase transition-transform hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                fontFamily: "var(--font-bangers, Bangers, cursive)",
                letterSpacing: "0.08em",
                border: "2px solid #0D0D0D",
                boxShadow: "3px 3px 0px #0D0D0D",
                background: "#FFFFFF",
                color: "#0D0D0D",
              }}
            >
              ← PREV
            </button>
            <button
              onClick={() => setStart((s) => s + perPage)}
              disabled={!canNext}
              className="px-5 py-2 text-sm font-black uppercase transition-transform hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                fontFamily: "var(--font-bangers, Bangers, cursive)",
                letterSpacing: "0.08em",
                border: "2px solid #0D0D0D",
                boxShadow: "3px 3px 0px #0D0D0D",
                background: "#E8001C",
                color: "#FFFFFF",
              }}
            >
              NEXT →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
