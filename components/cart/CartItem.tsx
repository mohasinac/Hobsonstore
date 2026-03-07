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
      <div className="relative h-16 w-16 flex-shrink-0 rounded bg-gray-50">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="64px"
          className="object-contain rounded"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <p className="text-sm font-medium text-gray-900 line-clamp-2">
          {item.name}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (item.qty <= 1) remove(item.productId);
                else updateQty(item.productId, item.qty - 1);
              }}
              className="flex h-6 w-6 items-center justify-center rounded border text-sm hover:bg-gray-100"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-6 text-center text-sm">{item.qty}</span>
            <button
              onClick={() => updateQty(item.productId, item.qty + 1)}
              className="flex h-6 w-6 items-center justify-center rounded border text-sm hover:bg-gray-100"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-red-600">
              {formatINR(item.salePrice * item.qty)}
            </span>
            <button
              onClick={() => remove(item.productId)}
              className="text-gray-400 hover:text-red-500 text-xs"
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
