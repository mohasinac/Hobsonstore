import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductCard } from "@/components/product/ProductCard";
import { ROUTES } from "@/constants/routes";
import type { Product } from "@/types/product";
import type { HomeSection as HomeSectionType } from "@/types/content";

interface HomeSectionProps {
  section: HomeSectionType;
  products: Product[];
}

export function HomeSection({ section, products }: HomeSectionProps) {
  if (products.length === 0) return null;

  return (
    <section
      className="home-section"
      style={{
        minHeight: "calc(100svh - var(--header-height))",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingBlock: "clamp(3rem, 6vh, 5rem)",
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
        {/* Header */}
        <div className="mb-7 flex flex-wrap items-end justify-between gap-y-2">
          <div>
            {section.subtitle && (
              <p
                className="mb-1 text-xs font-black uppercase tracking-widest home-section__label"
                style={{ letterSpacing: "0.18em" }}
              >
                {section.subtitle}
              </p>
            )}
            <h2
              className="home-section__title"
              style={{
                fontFamily: "var(--font-bangers, Bangers, cursive)",
                fontSize: "clamp(1.7rem, 4.5vw, 2.6rem)",
                letterSpacing: "0.08em",
                lineHeight: 1,
              }}
            >
              {section.title}
            </h2>
          </div>
          {section.collectionSlug && (
            <Link
              href={ROUTES.COLLECTION(section.collectionSlug)}
              className="inline-flex items-center gap-1.5 text-sm font-black uppercase transition-all hover:-translate-y-0.5"
              style={{
                fontFamily: "var(--font-bangers, Bangers, cursive)",
                letterSpacing: "0.1em",
                fontSize: "0.9rem",
                color: "var(--color-black)",
                background: "var(--color-yellow)",
                padding: "6px 14px",
              }}
            >
              VIEW ALL →
            </Link>
          )}
        </div>

        {/* Products — horizontal scroll on mobile, grid on sm+ */}
        <div className="hidden sm:block">
          <ProductGrid products={products.slice(0, section.itemLimit)} />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 sm:hidden scrollbar-none">
          {products.slice(0, section.itemLimit).map((product) => (
            <div key={product.id} className="w-44 shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
