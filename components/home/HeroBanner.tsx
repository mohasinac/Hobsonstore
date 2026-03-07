"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { HERO_AUTOPLAY_MS } from "@/constants/ui";
import type { Banner } from "@/types/content";

interface HeroBannerProps {
  banners: Banner[];
}

export function HeroBanner({ banners }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(next, HERO_AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [next, banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[current]!;

  return (
    <div className="relative overflow-hidden" style={{ minHeight: 400 }}>
      {/* Background */}
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{ backgroundColor: banner.backgroundColor ?? "#111" }}
      />
      {banner.backgroundImage && (
        <Image
          src={banner.backgroundImage}
          alt={banner.title}
          fill
          className="object-cover"
          priority
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex min-h-[400px] flex-col items-center justify-center px-6 py-16 text-center">
        <h2
          className="mb-3 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl"
          style={{ color: banner.textColor ?? "#fff" }}
        >
          {banner.title}
        </h2>
        {banner.subtitle && (
          <p
            className="mb-6 max-w-xl text-sm sm:text-base"
            style={{ color: banner.textColor ?? "#fff" }}
          >
            {banner.subtitle}
          </p>
        )}
        {banner.ctaLabel && banner.ctaUrl && (
          <Link
            href={banner.ctaUrl}
            className="rounded-full bg-red-600 px-8 py-3 text-sm font-bold text-white transition hover:bg-red-700"
          >
            {banner.ctaLabel}
          </Link>
        )}
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 w-2 rounded-full transition-all ${
                i === current ? "w-6 bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
