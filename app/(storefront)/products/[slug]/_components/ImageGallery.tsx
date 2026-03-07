"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

interface ImageGalleryProps {
  images: string[];
  name: string;
}

export function ImageGallery({ images, name }: ImageGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const safeImages = images.length > 0 ? images : ["/placeholder.png"];

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div
        className="relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-lg bg-gray-50"
        onClick={() => setZoomed(true)}
      >
        <Image
          src={safeImages[selected] ?? "/placeholder.png"}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
          priority
        />
      </div>

      {/* Thumbnail strip */}
      {safeImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {safeImages.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={cn(
                "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border-2 bg-gray-50",
                selected === i ? "border-red-600" : "border-gray-200",
              )}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${name} thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom modal */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoomed(false)}
        >
          <div className="relative h-[80vh] w-[80vw]">
            <Image
              src={safeImages[selected] ?? "/placeholder.png"}
              alt={name}
              fill
              sizes="80vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
