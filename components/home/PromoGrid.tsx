import Image from "next/image";
import Link from "next/link";
import type { PromoBanner } from "@/types/content";

interface PromoGridProps {
  banners: PromoBanner[];
}

export function PromoGrid({ banners }: PromoGridProps) {
  if (banners.length === 0) return null;

  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {banners.slice(0, 4).map((banner) => (
            <Link
              key={banner.id}
              href={banner.ctaUrl}
              className="group relative overflow-hidden rounded-lg bg-gray-900"
              style={{ minHeight: 200 }}
            >
              {banner.image && (
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <p className="text-sm font-bold leading-tight">{banner.title}</p>
                <span className="mt-1 inline-block text-xs text-red-400 group-hover:underline">
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
