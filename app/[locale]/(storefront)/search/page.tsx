import type { Metadata } from "next";
import { searchProductsServer } from "@/lib/firebase/server";
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
  const products = query ? await searchProductsServer(query).catch(() => []) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1
        className="mb-6"
        style={{
          fontFamily: "var(--font-bangers, Bangers, cursive)",
          fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
          letterSpacing: "0.06em",
          color: "#0D0D0D",
        }}
      >
        {query ? `RESULTS FOR "${query.toUpperCase()}"` : "SEARCH"}
      </h1>

      {!query && (
        <p style={{ color: "#6B6B6B" }}>
          Enter a search term above to find products.
        </p>
      )}

      {query && products.length === 0 && (
        <div className="py-16 text-center">
          <p
            className="text-lg"
            style={{
              fontFamily: "var(--font-bangers, Bangers, cursive)",
              letterSpacing: "0.06em",
              color: "#0D0D0D",
            }}
          >
            No products found for &ldquo;{query}&rdquo;
          </p>
          <Link
            href={ROUTES.COLLECTIONS}
            className="mt-4 inline-block text-sm font-bold hover:underline"
            style={{ color: "#E8001C" }}
          >
            Browse all products →
          </Link>
        </div>
      )}

      {products.length > 0 && <ProductGrid products={products} />}
    </div>
  );
}
