"use client";

import { useCartStore } from "@/store/cartStore";
import type { CartItem } from "@/types/cart";

export function useCart() {
  const items = useCartStore((s) => s.items);
  const add = useCartStore((s) => s.add);
  const remove = useCartStore((s) => s.remove);
  const updateQty = useCartStore((s) => s.updateQty);
  const clear = useCartStore((s) => s.clear);
  const total = useCartStore((s) => s.total);
  const itemCount = useCartStore((s) => s.itemCount);

  return { items, add, remove, updateQty, clear, total, itemCount };
}

export type { CartItem };
