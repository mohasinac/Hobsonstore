"use client";

import { useCart } from "@/hooks/useCart";
import { formatINR } from "@/lib/formatCurrency";

export function CartSummary() {
  const { total } = useCart();

  return (
    <div className="flex items-center justify-between text-sm font-medium text-gray-900">
      <span>Subtotal</span>
      <span className="text-base font-bold">{formatINR(total())}</span>
    </div>
  );
}
