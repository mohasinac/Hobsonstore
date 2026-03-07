"use client";

import Link from "next/link";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { EmptyCart } from "./EmptyCart";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/constants/routes";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items } = useCart();

  return (
    <Drawer open={open} onClose={onClose} side="right">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <EmptyCart onClose={onClose} />
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4">
            <CartSummary />
            <Link href={ROUTES.CHECKOUT} onClick={onClose}>
              <Button fullWidth className="mt-3">
                Check Out
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Drawer>
  );
}
