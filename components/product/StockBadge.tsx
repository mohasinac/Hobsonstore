import { Badge } from "@/components/ui/Badge";
import { DEFAULT_LOW_STOCK_THRESHOLD } from "@/constants/inventory";

interface StockBadgeProps {
  inStock: boolean;
  isPreorder: boolean;
  availableStock: number;
  lowStockThreshold?: number;
}

export function StockBadge({
  inStock,
  isPreorder,
  availableStock,
  lowStockThreshold = DEFAULT_LOW_STOCK_THRESHOLD,
}: StockBadgeProps) {
  if (isPreorder) return <Badge variant="preorder">Pre-order</Badge>;
  if (!inStock) return <Badge variant="soldout">Sold Out</Badge>;
  if (availableStock <= lowStockThreshold)
    return <Badge variant="sale">Only {availableStock} left</Badge>;
  return <Badge variant="new">In Stock</Badge>;
}
