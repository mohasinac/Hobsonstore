import { cn } from "@/lib/cn";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types/product";

interface ProductGridProps {
  products: Product[];
  className?: string;
}

export function ProductGrid({ products, className }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center" style={{ color: "#6B6B6B" }}>
        <p
          className="text-lg"
          style={{
            fontFamily: "var(--font-bangers, Bangers, cursive)",
            letterSpacing: "0.06em",
            color: "#0D0D0D",
          }}
        >
          NO PRODUCTS FOUND
        </p>
        <p className="mt-1 text-sm font-medium">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
