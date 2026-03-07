"use client";

import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { formatINR } from "@/lib/formatCurrency";
import type { CartItem as CartItemType } from "@/types/cart";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { remove, updateQty } = useCart();

  return (
    <div className="flex gap-3">
      <div
        className="relative h-16 w-16 flex-shrink-0"
        style={{ border: "2px solid #0D0D0D", background: "#F5F5F0" }}
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="64px"
          className="object-contain"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <p className="text-sm font-bold line-clamp-2" style={{ color: "#0D0D0D" }}>
          {item.name}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (item.qty <= 1) remove(item.productId);
                else updateQty(item.productId, item.qty - 1);
              }}
              className="flex h-6 w-6 items-center justify-center text-sm font-bold"
              style={{ border: "2px solid #0D0D0D", background: "#FFFEF0" }}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-6 text-center text-sm font-bold" style={{ color: "#0D0D0D" }}>{item.qty}</span>
            <button
              onClick={() => updateQty(item.productId, item.qty + 1)}
              className="flex h-6 w-6 items-center justify-center text-sm font-bold"
              style={{ border: "2px solid #0D0D0D", background: "#FFFEF0" }}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black" style={{ color: "#E8001C" }}>
              {formatINR(item.salePrice * item.qty)}
            </span>
            <button
              onClick={() => remove(item.productId)}
              className="text-xs font-bold"
              style={{ color: "#6B6B6B" }}
              aria-label="Remove item"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
