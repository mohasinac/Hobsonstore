"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";
import { AddressForm } from "@/components/checkout/AddressForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { CoinRedeemToggle } from "@/components/checkout/CoinRedeemToggle";
import { DiscountCodeInput } from "@/components/checkout/DiscountCodeInput";
import { getLoyaltyConfig } from "@/lib/firebase/config";
import { getUser } from "@/lib/firebase/users";
import { validateDiscount } from "@/lib/firebase/discounts";
import {
  calculateMaxRedeemable,
  applyCoinsToOrder,
  coinsToRupees,
} from "@/lib/loyalty";
import { ROUTES } from "@/constants/routes";
import type { Address } from "@/types/order";
import type { LoyaltyConfig, Discount } from "@/types/config";

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

  // Loyalty & coins
  const [loyaltyConfig, setLoyaltyConfig] = useState<LoyaltyConfig | null>(null);
  const [userCoins, setUserCoins] = useState(0);
  const [coinsEnabled, setCoinsEnabled] = useState(false);

  // Discount code
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);

  const subtotal = total();

  const discountAmount = appliedDiscount
    ? appliedDiscount.type === "percent"
      ? Math.floor((subtotal * appliedDiscount.value) / 100)
      : Math.min(appliedDiscount.value, subtotal)
    : 0;

  const postDiscountTotal = subtotal - discountAmount;

  const maxRedeemableCoins = loyaltyConfig
    ? calculateMaxRedeemable(userCoins, postDiscountTotal, loyaltyConfig)
    : 0;

  const coinsDiscount =
    coinsEnabled && loyaltyConfig
      ? applyCoinsToOrder(maxRedeemableCoins, postDiscountTotal, loyaltyConfig)
      : 0;

  const coinsSavingsAmount =
    loyaltyConfig && maxRedeemableCoins > 0
      ? coinsToRupees(maxRedeemableCoins, loyaltyConfig)
      : 0;

  useEffect(() => {
    getLoyaltyConfig().then((cfg) => {
      if (cfg?.active) setLoyaltyConfig(cfg);
    });
  }, []);

  useEffect(() => {
    if (user) {
      getUser(user.uid).then((u) => {
        if (u) setUserCoins(u.fccCoins);
      });
    }
  }, [user]);

  useEffect(() => {
    if (items.length === 0) {
      router.replace(ROUTES.CART);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items.length === 0) return null;

  async function handleApplyDiscount(code: string) {
    setDiscountLoading(true);
    try {
      const discount = await validateDiscount(code, subtotal);
      if (!discount) {
        toast("Invalid, expired, or inapplicable discount code.", "error");
        return;
      }
      setAppliedDiscount(discount);
    } finally {
      setDiscountLoading(false);
    }
  }

  function handleRemoveDiscount() {
    setAppliedDiscount(null);
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
          total: subtotal,
          discountCode: appliedDiscount?.code ?? null,
          coinsToRedeem: coinsEnabled ? maxRedeemableCoins : 0,
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
      // Open WhatsApp in a new tab so the current page can navigate to order tracking.
      window.open(waUrl, "_blank", "noopener,noreferrer");
      router.push(ROUTES.ORDER_TRACK(orderId));
    } catch {
      toast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1
        className="mb-8"
        style={{
          fontFamily: "var(--font-bangers, Bangers, cursive)",
          fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
          letterSpacing: "0.06em",
          color: "#0D0D0D",
        }}
      >
        CHECKOUT
      </h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Address + offers */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-black uppercase" style={{ color: "#0D0D0D", letterSpacing: "0.04em" }}>Delivery Address</h2>
          <AddressForm value={address} onChange={setAddress} />

          {/* Coins toggle - shown only to logged-in users with active loyalty */}
          {loyaltyConfig && user && (
            <CoinRedeemToggle
              availableCoins={userCoins}
              savingsAmount={coinsSavingsAmount}
              enabled={coinsEnabled}
              onToggle={setCoinsEnabled}
              loyaltyActive={loyaltyConfig.active}
            />
          )}

          {/* Discount code */}
          <DiscountCodeInput
            appliedCode={appliedDiscount?.code ?? null}
            discountAmount={discountAmount}
            onApply={handleApplyDiscount}
            onRemove={handleRemoveDiscount}
            loading={discountLoading}
          />
        </div>

        {/* Order summary */}
        <div>
          <h2 className="mb-4 text-lg font-black uppercase" style={{ color: "#0D0D0D", letterSpacing: "0.04em" }}>Order Summary</h2>
          <div
            className="p-5"
            style={{
              border: "2px solid #0D0D0D",
              boxShadow: "3px 3px 0px #0D0D0D",
              background: "#FFFEF0",
            }}
          >
            <OrderSummary
              items={items}
              subtotal={subtotal}
              discountAmount={discountAmount}
              coinsDiscount={coinsDiscount}
            />

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
