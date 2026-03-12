"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";

export default function CartPage() {
  const { items } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 px-4 py-20 text-center">
        <span style={{ fontSize: "3rem" }}>🛒</span>
        <h1
          className="font-comic"
          style={{
            fontSize: "clamp(1.6rem, 4vw, 2rem)",
            color: "var(--section-title-color)",
          }}
        >
          YOUR CART IS EMPTY
        </h1>
        <p style={{ color: "var(--color-muted)" }}>
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link href={ROUTES.COLLECTIONS}>
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1
        className="font-comic mb-8"
        style={{
          fontSize: "clamp(1.6rem, 4vw, 2rem)",
          color: "var(--section-title-color)",
        }}
      >
        YOUR CART
      </h1>
      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        {/* Line items */}
        <div className="flex flex-1 flex-col gap-4">
          {items.map((item) => (
            <CartItem key={item.productId} item={item} />
          ))}
        </div>

        {/* Summary */}
        <div className="md:w-72">
          <div
            className="p-5"
            style={{
              border: "var(--card-border)",
              boxShadow: "var(--card-shadow)",
              background: "var(--surface-warm)",
            }}
          >
            <CartSummary />
            <p className="mt-2 text-xs" style={{ color: "var(--color-muted)" }}>
              Taxes + free shipping included.
            </p>
            <Link href={ROUTES.CHECKOUT} className="mt-4 block">
              <Button fullWidth>Check Out</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
