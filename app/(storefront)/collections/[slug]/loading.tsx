import { ProductCardSkeleton } from "@/components/product/ProductCard.skeleton";

export default function CollectionLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 h-8 w-48 animate-pulse rounded" style={{ background: '#E5E5D8' }} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
