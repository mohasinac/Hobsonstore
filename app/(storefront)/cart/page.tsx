"use client";

import Link from "next/link";
import Image from "next/image";
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
        <Image
          src="/icons/cart.svg"
          alt=""
          width={64}
          height={64}
          aria-hidden="true"
        />
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="text-gray-500">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link href={ROUTES.COLLECTION("all")}>
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Your Cart</h1>
      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        {/* Line items */}
        <div className="flex flex-1 flex-col gap-4">
          {items.map((item) => (
            <CartItem key={item.productId} item={item} />
          ))}
        </div>

        {/* Summary */}
        <div className="md:w-72">
          <div className="rounded-lg border border-gray-200 p-5">
            <CartSummary />
            <p className="mt-2 text-xs text-gray-400">
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
