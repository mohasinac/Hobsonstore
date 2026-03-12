import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";
import type { Brand } from "@/types/brand";

interface BrandStripProps {
  brands: Brand[];
}

export function BrandStrip({ brands }: BrandStripProps) {
  if (brands.length === 0) return null;

  // Duplicate for seamless infinite loop
  const items = [...brands, ...brands];

  return (
    <section
      style={{
        background: "var(--card-bg)",
        borderTop: "var(--section-border)",
        borderBottom: "var(--section-border)",
        paddingBlock: "clamp(24px, 3.5vh, 48px)",
        overflow: "hidden",
      }}
    >
      {/* Section heading — centered */}
      <div className="mx-auto max-w-5xl px-4 mb-6 text-center">
        <h2
          style={{
            fontFamily: "var(--font-bangers, Bangers, cursive)",
            fontSize: "clamp(1.4rem, 3.5vw, 2rem)",
            letterSpacing: "0.1em",
            color: "var(--section-title-color)",
            lineHeight: 1,
          }}
        >
          OFFICIAL BRANDS
        </h2>
      </div>

      {/* Infinite marquee track */}
      <div className="marquee-track overflow-hidden">
        <div className="animate-marquee-slow items-center gap-12">
          {items.map((brand, i) => (
            <Link
              key={`${brand.slug}-${i}`}
              href={ROUTES.BRAND(brand.slug)}
              className="group flex-shrink-0 inline-flex flex-col items-center gap-2 transition-all hover:-translate-y-0.5"
              style={{
                border: "var(--card-border)",
                boxShadow: "var(--card-shadow)",
                background: "var(--card-bg)",
                padding: "12px",
              }}
            >
              <div
                className="relative transition-all duration-300 group-hover:opacity-90"
                style={{ height: 180, width: 180 }}
              >
                {brand.logoImage ? (
                  <Image
                    src={brand.logoImage}
                    alt={brand.name}
                    fill
                    className="object-contain"
                    sizes="110px"
                  />
                ) : (
                  <span
                    className="flex h-full items-center justify-center text-xs font-black"
                    style={{
                      fontFamily: "var(--font-bangers, Bangers, cursive)",
                      letterSpacing: "0.08em",
                      color: "var(--card-text)",
                    }}
                  >
                    {brand.name}
                  </span>
                )}
              </div>
              <p
                className="text-xs font-bold uppercase tracking-wide"
                style={{ color: "var(--color-muted)", letterSpacing: "0.06em" }}
              >
                {brand.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

