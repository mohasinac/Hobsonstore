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
    <section
      className="py-8"
      style={{
        background: "#0D0D0D",
        borderBottom: "3px solid #0D0D0D",
      }}
    >
      <div className="mx-auto max-w-7xl px-4">
        <h2
          className="mb-5 text-center"
          style={{
            fontFamily: "var(--font-bangers, Bangers, cursive)",
            fontSize: "clamp(1.2rem, 3vw, 1.6rem)",
            letterSpacing: "0.12em",
            color: "#FFE500",
          }}
        >
          BROWSE BY BRAND
        </h2>
        <div className="flex items-center gap-8 overflow-x-auto pb-2 scrollbar-none justify-center flex-wrap">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={ROUTES.COLLECTION(brand.slug)}
              className="group flex-shrink-0 transition-transform hover:-translate-y-0.5"
            >
              <div className="relative h-12 w-28 opacity-60 grayscale transition group-hover:opacity-100 group-hover:grayscale-0">
                {brand.logoImage ? (
                  <Image
                    src={brand.logoImage}
                    alt={brand.name}
                    fill
                    className="object-contain"
                    sizes="112px"
                  />
                ) : (
                  <span
                    className="flex h-full items-center justify-center text-xs font-bold"
                    style={{ color: "#CBD5E1" }}
                  >
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
