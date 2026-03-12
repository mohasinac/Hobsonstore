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
          <span className="flex-1 truncate mr-2" style={{ color: "var(--color-black)" }}>
            {item.name} ×{item.qty}
          </span>
          <span className="font-bold" style={{ color: "var(--color-black)" }}>{formatINR(item.salePrice * item.qty)}</span>
        </div>
      ))}

      <div className="border-t pt-3 flex flex-col gap-1.5 text-sm">
        <div className="flex justify-between" style={{ color: "var(--color-muted)" }}>
          <span>Subtotal</span>
          <span>{formatINR(subtotal)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between font-bold" style={{ color: "#16a34a" }}>
            <span>Discount</span>
            <span>−{formatINR(discountAmount)}</span>
          </div>
        )}

        {coinsDiscount > 0 && (
          <div className="flex justify-between font-bold" style={{ color: "#d97706" }}>
            <span>HC Coins</span>
            <span>−{formatINR(coinsDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between font-black text-base pt-2 mt-1" style={{ borderTop: "2px solid var(--border-ink)", color: "var(--color-black)" }}>
          <span>Total</span>
          <span style={{ color: "var(--color-red)" }}>{formatINR(total)}</span>
        </div>

        <p className="text-xs" style={{ color: "var(--color-muted)" }}>Free shipping. No hidden charges.</p>
      </div>
    </div>
  );
}
