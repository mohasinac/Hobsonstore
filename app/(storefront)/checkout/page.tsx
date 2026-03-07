"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";
import { AddressForm } from "@/components/checkout/AddressForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { ROUTES } from "@/constants/routes";
import type { Address } from "@/types/order";

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState<Address>({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  if (items.length === 0) {
    router.replace(ROUTES.CART);
    return null;
  }

  async function handlePlaceOrder() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          address,
          userId: user?.uid ?? "guest",
          total: total(),
        }),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        toast(err.error ?? "Checkout failed. Please try again.", "error");
        return;
      }

      const { orderId, waUrl } = (await res.json()) as {
        orderId: string;
        waUrl: string;
      };
      clear();
      window.location.href = waUrl;
      setTimeout(() => router.push(ROUTES.ORDER_TRACK(orderId)), 2000);
    } catch {
      toast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  const subtotal = total();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Checkout</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Address */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Delivery Address</h2>
          <AddressForm value={address} onChange={setAddress} />
        </div>

        {/* Order summary */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Order Summary</h2>
          <div className="rounded-lg border border-gray-200 p-5">
            <OrderSummary items={items} subtotal={subtotal} />

            <Button
              fullWidth
              onClick={handlePlaceOrder}
              loading={loading}
              className="mt-4"
              disabled={
                !address.name ||
                !address.phone ||
                !address.line1 ||
                !address.city ||
                !address.pincode
              }
            >
              Place Order via WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

