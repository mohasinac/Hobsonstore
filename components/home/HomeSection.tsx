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
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-extrabold uppercase tracking-tight text-gray-900 sm:text-2xl">
              {section.title}
            </h2>
            {section.subtitle && (
              <p className="mt-1 text-sm text-gray-500">{section.subtitle}</p>
            )}
          </div>
          {section.collectionSlug && (
            <Link
              href={ROUTES.COLLECTION(section.collectionSlug)}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              View all
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
                <span className="font-medium text-gray-800 line-clamp-2">
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
