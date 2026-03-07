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
    <section className="bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-8 text-center text-xl font-extrabold uppercase tracking-tight text-gray-900 sm:text-2xl">
          What Our Customers Say
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((t) => (
            <div
              key={t.id}
              className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <StarRating rating={t.rating} />
              <p className="flex-1 text-sm leading-relaxed text-gray-700">
                &ldquo;{t.text}&rdquo;
              </p>
              <p className="text-xs font-semibold text-gray-900">{t.name}</p>
            </div>
          ))}
        </div>

        {testimonials.length > perPage && (
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => setStart((s) => Math.max(0, s - perPage))}
              disabled={!canPrev}
              className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium hover:border-red-500 hover:text-red-600 disabled:opacity-30"
            >
              ← Prev
            </button>
            <button
              onClick={() => setStart((s) => s + perPage)}
              disabled={!canNext}
              className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium hover:border-red-500 hover:text-red-600 disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
