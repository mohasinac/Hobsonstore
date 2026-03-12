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
        <div
          className="flex items-center justify-between p-4"
          style={{ background: "var(--color-yellow)", borderBottom: "3px solid var(--border-ink)" }}
        >
          <h2
            style={{
              fontFamily: "var(--font-bangers, Bangers, cursive)",
              fontSize: "1.3rem",
              letterSpacing: "0.08em",
              color: "#1A1A1A",
            }}
          >
            YOUR CART
          </h2>
          <button
            onClick={onClose}
            aria-label="Close cart"
            style={{ color: "#1A1A1A", fontWeight: 900, fontSize: "1.2rem" }}
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
          <div className="p-4" style={{ borderTop: "3px solid var(--border-ink)" }}>
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
