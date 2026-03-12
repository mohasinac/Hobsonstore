import { formatINR } from "@/lib/formatCurrency";
import { cn } from "@/lib/cn";

interface PriceTagProps {
  salePrice: number;
  regularPrice: number;
  inStock: boolean;
  isPreorder?: boolean;
  className?: string;
}

export function PriceTag({
  salePrice,
  regularPrice,
  inStock,
  isPreorder,
  className,
}: PriceTagProps) {
  const isOnSale = salePrice < regularPrice;

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className="text-2xl font-black" style={{ color: "var(--color-red)" }}>
        {formatINR(salePrice)}
      </span>
      {isOnSale && (
        <span className="text-base line-through" style={{ color: "#9CA3AF" }}>
          {formatINR(regularPrice)}
        </span>
      )}
      {!inStock && !isPreorder && (
        <span className="text-sm font-bold" style={{ color: "#6B6B6B" }}>— Sold Out</span>
      )}
      {isPreorder && (
        <span className="text-sm font-medium text-amber-600">— Pre-order</span>
      )}
    </div>
  );
}
