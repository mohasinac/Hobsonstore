import { formatINR } from "@/lib/formatCurrency";
import type { CartItem } from "@/types/cart";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  discountAmount?: number;
  coinsDiscount?: number;
}

export function OrderSummary({
  items,
  subtotal,
  discountAmount = 0,
  coinsDiscount = 0,
}: OrderSummaryProps) {
  const total = subtotal - discountAmount - coinsDiscount;

  return (
    <div className="flex flex-col gap-3">
      {/* Line items */}
      {items.map((item) => (
        <div key={item.productId} className="flex justify-between text-sm">
          <span className="flex-1 truncate text-gray-700 mr-2">
            {item.name} ×{item.qty}
          </span>
          <span className="font-medium">{formatINR(item.salePrice * item.qty)}</span>
        </div>
      ))}

      <div className="border-t pt-3 flex flex-col gap-1.5 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatINR(subtotal)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Discount</span>
            <span>−{formatINR(discountAmount)}</span>
          </div>
        )}

        {coinsDiscount > 0 && (
          <div className="flex justify-between text-amber-700">
            <span>FCC Coins</span>
            <span>−{formatINR(coinsDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between font-bold text-base border-t pt-2 mt-1">
          <span>Total</span>
          <span>{formatINR(total)}</span>
        </div>

        <p className="text-xs text-gray-400">Free shipping. No hidden charges.</p>
      </div>
    </div>
  );
}
