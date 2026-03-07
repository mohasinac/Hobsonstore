import type { Metadata } from "next";
import { searchProducts } from "@/lib/firebase/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const products = query ? await searchProducts(query).catch(() => []) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {query ? `Results for "${query}"` : "Search"}
      </h1>

      {!query && (
        <p className="text-gray-500">
          Enter a search term above to find products.
        </p>
      )}

      {query && products.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg font-medium text-gray-700">
            No products found for &ldquo;{query}&rdquo;
          </p>
          <Link
            href={ROUTES.COLLECTION("all")}
            className="mt-4 inline-block text-sm text-red-600 hover:underline"
          >
            Browse all products
          </Link>
        </div>
      )}

      {products.length > 0 && <ProductGrid products={products} />}
    </div>
  );
}
