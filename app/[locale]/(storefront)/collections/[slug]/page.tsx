import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionServer, getProductsServer } from "@/lib/firebase/server";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilterSidebar } from "@/components/product/ProductFilterSidebar";
import { generateCollectionMetadata } from "@/lib/seo";

export const revalidate = 300;

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    brand?: string;
    franchise?: string;
    inStock?: string;
    priceMin?: string;
    priceMax?: string;
  }>;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const col = await getCollectionServer(slug).catch(() => null);
  if (!col) return { title: "Collection not found" };
  return generateCollectionMetadata(col);
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const col = await getCollectionServer(slug).catch(() => null);
  if (!col) notFound();

  // Curated collections filter: use manualProductIds, filterFranchises, filterBrands, or filterTags
  // For now, fall back to brand/franchise URL params for simple tag-based curated collections
  const products = await getProductsServer({
    franchise: sp.franchise ?? (col.filterFranchises?.length === 1 ? col.filterFranchises[0] : undefined),
    brand: sp.brand ?? (col.filterBrands?.length === 1 ? col.filterBrands[0] : undefined),
    inStock: sp.inStock === "true" ? true : undefined,
    sort: (sp.sort as "price_asc" | "price_desc" | "newest" | "name_asc") ?? "newest",
    priceMin: sp.priceMin ? Number(sp.priceMin) : undefined,
    priceMax: sp.priceMax ? Number(sp.priceMax) : undefined,
  }).catch(() => []);

  return (
    <div
      className="mx-auto max-w-7xl px-4 py-8"
      style={{ minHeight: "calc(100svh - var(--header-height))" }}
    >
      {/* Collection header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-bangers)", color: "var(--color-black)", letterSpacing: "0.06em" }}>{col.name}</h1>
        {col.description && (
          <p className="mt-2" style={{ color: "var(--text-muted-strong)" }}>{col.description}</p>
        )}
        <p className="mt-1 text-sm font-semibold" style={{ color: "var(--text-muted-strong)" }}>{products.length} products</p>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Filters */}
        <div className="w-full md:w-56 shrink-0">
          <ProductFilterSidebar />
        </div>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}
