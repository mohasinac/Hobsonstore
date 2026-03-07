"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/components/ui/ToastProvider";
import { ROUTES } from "@/constants/routes";
import type { Product } from "@/types/product";
import { useRouter } from "next/navigation";

interface AddToCartSectionProps {
  product: Product;
}

export function AddToCartSection({ product }: AddToCartSectionProps) {
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const max = product.isPreorder ? 10 : Math.min(product.availableStock, 10);
  const canAdd = product.inStock || product.isPreorder;

  function handleAddToCart() {
    if (!canAdd) return;
    add({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] ?? "",
      salePrice: product.salePrice,
      qty,
      isPreorder: product.isPreorder,
    });
    toast(
      product.isPreorder ? "Pre-order added to cart!" : "Added to cart!",
      "success",
    );
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push(ROUTES.CHECKOUT);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Qty stepper */}
      {canAdd && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Quantity</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-8 w-8 items-center justify-center rounded border text-sm hover:bg-gray-100"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-medium">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(max, q + 1))}
              className="flex h-8 w-8 items-center justify-center rounded border text-sm hover:bg-gray-100"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* CTA buttons */}
      <Button onClick={handleAddToCart} disabled={!canAdd} fullWidth>
        {product.isPreorder
          ? "Pre-order Now"
          : canAdd
            ? "Add to Cart"
            : "Sold Out"}
      </Button>

      {canAdd && (
        <Button variant="secondary" onClick={handleBuyNow} fullWidth>
          Buy It Now
        </Button>
      )}
    </div>
  );
}
