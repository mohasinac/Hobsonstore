import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";
import type { Collection } from "@/types/content";

interface BrandStripProps {
  brands: Collection[];
}

export function BrandStrip({ brands }: BrandStripProps) {
  if (brands.length === 0) return null;

  return (
    <section className="border-y border-gray-100 bg-gray-50 py-6">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-4 text-center text-sm font-bold uppercase tracking-widest text-gray-500">
          Browse by Brand
        </h2>
        <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-none">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={ROUTES.COLLECTION(brand.slug)}
              className="group flex-shrink-0"
            >
              <div className="relative h-12 w-24 opacity-70 grayscale transition group-hover:opacity-100 group-hover:grayscale-0">
                {brand.logoImage && (
                  <Image
                    src={brand.logoImage}
                    alt={brand.name}
                    fill
                    className="object-contain"
                    sizes="96px"
                  />
                )}
                {!brand.logoImage && (
                  <span className="flex h-full items-center justify-center text-xs font-bold text-gray-600">
                    {brand.name}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
