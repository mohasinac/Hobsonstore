"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { getProductById } from "@/lib/firebase/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Spinner } from "@/components/ui/Spinner";
import { ROUTES } from "@/constants/routes";
import type { Product } from "@/types/product";

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { productIds } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(ROUTES.LOGIN);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (authLoading || !user) return;
    void (async () => {
      if (productIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        const results = await Promise.all(productIds.map((id) => getProductById(id)));
        setProducts(results.filter(Boolean) as Product[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading, productIds]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1
        style={{
          fontFamily: "var(--font-bangers, Bangers, cursive)",
          fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
          letterSpacing: "0.06em",
          color: "var(--color-black)",
        }}
      >
        MY WISHLIST
      </h1>

      {products.length === 0 ? (
        <div
          className="py-16 text-center"
          style={{
            border: "2px dashed var(--border-ink)",
            background: "var(--surface-elevated)",
          }}
        >
          <p
            className="text-lg"
            style={{
              fontFamily: "var(--font-bangers, Bangers, cursive)",
              letterSpacing: "0.06em",
              color: "var(--color-black)",
            }}
          >
            Your wishlist is empty
          </p>
          <Link
            href={ROUTES.COLLECTIONS}
            className="mt-3 inline-block text-sm font-bold hover:underline"
            style={{ color: "#E8001C" }}
          >
            Explore products →
          </Link>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
