"use client";

import { useCart } from "@/hooks/useCart";
import { formatINR } from "@/lib/formatCurrency";

export function CartSummary() {
  const { total } = useCart();

  return (
    <div className="flex items-center justify-between text-sm font-bold" style={{ color: "var(--color-black)" }}>
      <span>Subtotal</span>
      <span className="text-base font-black" style={{ color: "var(--color-red)" }}>{formatINR(total())}</span>
    </div>
  );
}
