"use client";

import Image from "next/image";
import Link from "next/link";
import type { PromoBanner } from "@/types/content";

interface PromoGridProps {
  banners: PromoBanner[];
}

export function PromoGrid({ banners }: PromoGridProps) {
  if (banners.length === 0) return null;

  return (
    <section
      className="py-10 sm:py-16"
      style={{
        background: "var(--dark-section-alt)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4">
        {/* Dual-tier heading */}
        <div className="mb-7 flex flex-wrap items-end justify-between gap-y-2">
          <div>
            <p
              className="mb-1 text-xs font-black uppercase tracking-widest"
              style={{ color: "var(--color-red)", letterSpacing: "0.18em" }}
            >
              LIMITED TIME
            </p>
            <h2
              style={{
                fontFamily: "var(--font-bangers, Bangers, cursive)",
                fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
                letterSpacing: "0.08em",
                color: "#FFFFFF",
                lineHeight: 1,
              }}
            >
              HOT DEALS &amp; PROMOS
            </h2>
          </div>
        </div>

        {/*
          Layout: 1 large feature card (full width on mobile, col-span-2 on lg)
          + up to 3 smaller cards beside / below it.
          - Mobile: stacked single column
          - sm: 2 columns
          - lg: [large | 2×2 grid] = 3 cols where first spans 2 rows
        */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {banners.slice(0, 4).map((banner, i) => (
            <Link
              key={banner.id}
              href={banner.ctaUrl}
              className={`group relative block overflow-hidden ${i === 0 ? "sm:row-span-2" : ""}`}
              style={{
                minHeight: i === 0 ? "clamp(220px, 32vh, 480px)" : "clamp(130px, 16vh, 240px)",
                background: "var(--dark-section-card)",
              }}
            >
              {banner.image && (
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes={i === 0 ? "(max-width: 640px) 100vw, 40vw" : "(max-width: 640px) 50vw, 30vw"}
                />
              )}
              <div
                className="absolute inset-0"
                style={{
                  background: i === 0
                    ? "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)"
                    : "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 100%)",
                }}
              />
              {/* Yellow border on hover */}
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ boxShadow: "inset 0 0 0 2px var(--color-yellow)" }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p
                  className="leading-tight"
                  style={{
                    fontFamily: "var(--font-bangers, Bangers, cursive)",
                    fontSize: i === 0 ? "1.35rem" : "1rem",
                    letterSpacing: "0.06em",
                    color: "#FFFFFF",
                  }}
                >
                  {banner.title}
                </p>
                <span
                  className="mt-1 inline-flex items-center gap-1 text-xs font-black uppercase"
                  style={{ color: "var(--color-yellow)" }}>
                  {banner.ctaLabel} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
