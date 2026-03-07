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
    <div
      className="relative overflow-hidden"
      style={{
        minHeight: 480,
        borderBottom: "4px solid #0D0D0D",
      }}
    >
      {/* background */}
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{ backgroundColor: banner.backgroundColor ?? "#0D0D0D" }}
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
      {/* Halftone overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.08) 1.5px, transparent 1.5px)",
          backgroundSize: "14px 14px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-[480px] flex-col items-center justify-center px-6 py-20 text-center">
        {/* Comic speech-bubble style heading */}
        <h2
          className="mb-4 leading-none"
          style={{
            fontFamily: "var(--font-bangers, Bangers, cursive)",
            fontSize: "clamp(2.5rem, 8vw, 5rem)",
            letterSpacing: "0.05em",
            color: banner.textColor ?? "#FFE500",
            textShadow: "4px 4px 0px #0D0D0D, -1px -1px 0px #0D0D0D",
          }}
        >
          {banner.title}
        </h2>
        {banner.subtitle && (
          <p
            className="mb-8 max-w-xl text-base font-semibold px-4 py-2 rounded"
            style={{
              color: banner.textColor ?? "#FFFFFF",
              background: "rgba(0,0,0,0.45)",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          >
            {banner.subtitle}
          </p>
        )}
        {banner.ctaLabel && banner.ctaUrl && (
          <Link
            href={banner.ctaUrl}
            className="inline-block px-8 py-3 text-base font-black uppercase tracking-widest transition-transform hover:-translate-y-0.5"
            style={{
              fontFamily: "var(--font-bangers, Bangers, cursive)",
              letterSpacing: "0.1em",
              fontSize: "1.1rem",
              background: "#E8001C",
              color: "#FFFFFF",
              border: "3px solid #0D0D0D",
              boxShadow: "5px 5px 0px #0D0D0D",
            }}
          >
            {banner.ctaLabel}
          </Link>
        )}
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-5 left-0 right-0 z-10 flex justify-center gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="transition-all"
              style={{
                height: 10,
                width: i === current ? 28 : 10,
                borderRadius: 5,
                background: i === current ? "#FFE500" : "rgba(255,229,0,0.45)",
                border: "2px solid #0D0D0D",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
