import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
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
      className="py-10"
      style={{ background: "#FFFEF0", borderBottom: "2px solid #E5E0C4" }}
    >
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2
              style={{
                fontFamily: "var(--font-bangers, Bangers, cursive)",
                fontSize: "clamp(1.4rem, 4vw, 2rem)",
                letterSpacing: "0.08em",
                color: "#0D0D0D",
              }}
            >
              {section.title}
            </h2>
            {section.subtitle && (
              <p className="mt-1 text-sm font-medium" style={{ color: "#6B6B6B" }}>
                {section.subtitle}
              </p>
            )}
          </div>
          {section.collectionSlug && (
            <Link
              href={ROUTES.COLLECTION(section.collectionSlug)}
              className="text-sm font-black uppercase transition-colors"
              style={{
                color: "#E8001C",
                fontFamily: "var(--font-bangers, Bangers, cursive)",
                letterSpacing: "0.08em",
                fontSize: "0.95rem",
              }}
            >
              VIEW ALL →
            </Link>
          )}
        </div>

        {/* Products — horizontal scroll on mobile */}
        <div className="hidden sm:block">
          <ProductGrid products={products.slice(0, section.itemLimit)} />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 sm:hidden scrollbar-none">
          {products.slice(0, section.itemLimit).map((product) => (
            <div key={product.id} className="w-44 flex-shrink-0">
              <Link
                href={ROUTES.PRODUCT(product.slug)}
                className="block text-sm"
              >
                <span className="font-bold" style={{ color: "#1A1A2E" }}>
                  {product.name}
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
