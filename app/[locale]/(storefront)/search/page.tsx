import type { Metadata } from "next";
import {
  searchProductsServer,
  getProductsServer,
  getAllFranchisesServer,
  getAllBrandsServer,
} from "@/lib/firebase/server";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilterSidebar } from "@/components/product/ProductFilterSidebar";

export const revalidate = 60;

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    brand?: string;
    franchise?: string;
    inStock?: string;
    priceMin?: string;
    priceMax?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Shop All",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const query = sp.q?.trim() ?? "";

  const [products, franchises, brands] = await Promise.all([
    query
      ? searchProductsServer(query).catch(() => [])
      : getProductsServer(
          {
            franchise: sp.franchise,
            brand: sp.brand,
            inStock: sp.inStock === "true" ? true : undefined,
            sort: (sp.sort as "price_asc" | "price_desc" | "newest" | "name_asc") ?? "newest",
            priceMin: sp.priceMin ? Number(sp.priceMin) : undefined,
            priceMax: sp.priceMax ? Number(sp.priceMax) : undefined,
          },
          200,
        ).catch(() => []),
    getAllFranchisesServer().catch(() => []),
    getAllBrandsServer().catch(() => []),
  ]);

  const title = query ? `RESULTS FOR "${query.toUpperCase()}"` : "SHOP ALL";

  return (
    <div
      className="mx-auto max-w-7xl px-4 py-8"
      style={{ minHeight: "calc(100svh - var(--header-height))" }}
    >
      <h1
        className="font-comic mb-1"
        style={{
          fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
          color: "var(--section-title-color)",
        }}
      >
        {title}
      </h1>
      {!query && (
        <p className="mb-6 text-sm font-semibold" style={{ color: "var(--color-muted)" }}>
          {products.length} products
        </p>
      )}

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Filter sidebar */}
        <div className="w-full md:w-56 shrink-0">
          <ProductFilterSidebar franchises={franchises} brands={brands} />
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {query && products.length === 0 ? (
            <div className="py-16 text-center">
              <p
                className="font-comic text-lg"
                style={{ color: "var(--section-title-color)" }}
              >
                No products found for &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>
    </div>
  );
}
