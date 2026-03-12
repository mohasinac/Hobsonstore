import { StarRating } from "@/components/ui/StarRating";
import type { Testimonial } from "@/types/content";

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

export function TestimonialsCarousel({
  testimonials,
}: TestimonialsCarouselProps) {
  if (testimonials.length === 0) return null;

  return (
    <section
      style={{
        background: "var(--section-bg)",
        borderTop: "var(--section-border)",
        borderBottom: "var(--section-border)",
        minHeight: "calc(100svh - var(--header-height))",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingBlock: "clamp(3rem, 6vh, 5rem)",
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 flex flex-col" style={{ minHeight: 0 }}>
        {/* Dual-tier heading */}
        <div className="mb-6 text-center" style={{ flexShrink: 0 }}>
          <p
            className="mb-1 text-xs font-black uppercase tracking-widest"
            style={{ color: "var(--color-red)", letterSpacing: "0.18em" }}
          >
            COLLECTOR REVIEWS
          </p>
          <h2
            style={{
              fontFamily: "var(--font-bangers, Bangers, cursive)",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              letterSpacing: "0.08em",
              color: "var(--section-title-color)",
              lineHeight: 1,
            }}
          >
            WHAT OUR COLLECTORS SAY
          </h2>
        </div>

        {/* 2-row masonry grid — wraps into 2 rows, scrolls horizontally */}
        <div
          className="flex flex-col flex-wrap gap-4 overflow-x-auto scrollbar-none"
          style={{
            maxHeight: "50svh",
            alignContent: "flex-start",
          }}
        >
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="flex shrink-0 flex-col gap-3 p-5"
              style={{
                width: "clamp(260px, 28vw, 360px)",
                background: "var(--card-bg)",
                border: "var(--card-border)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <StarRating rating={t.rating} />
              <p
                className="flex-1 text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                &ldquo;{t.text}&rdquo;
              </p>
              <p
                className="text-xs font-black uppercase"
                style={{ color: "var(--color-yellow)", letterSpacing: "0.06em" }}
              >
                — {t.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
