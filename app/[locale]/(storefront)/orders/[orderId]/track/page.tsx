"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { doc, onSnapshot, getFirestore } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOrderStatusConfig } from "@/hooks/useOrderStatusConfig";
import { OrderStatusStepper } from "@/components/order/OrderStatusStepper";
import { TrackingBanner, SHIPPED_STATUSES } from "@/components/order/TrackingBanner";
import { OrderItemList } from "@/components/order/OrderItemList";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { Spinner } from "@/components/ui/Spinner";
import { formatINR } from "@/lib/formatCurrency";
import { COLLECTIONS } from "@/constants/firebase";
import { ROUTES } from "@/constants/routes";
import type { Order } from "@/types/order";

interface TrackPageProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderTrackPage({ params }: TrackPageProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { configs } = useOrderStatusConfig();

  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // Unwrap async params
  useEffect(() => {
    params.then(({ orderId: id }) => setOrderId(id));
  }, [params]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(ROUTES.LOGIN);
    }
  }, [user, authLoading, router]);

  // Real-time listener
  useEffect(() => {
    if (!orderId || !user) return;

    const db = getFirestore(getFirebaseApp());
    const ref = doc(db, COLLECTIONS.ORDERS, orderId);

    const unsubscribe = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setOrderLoading(false);
        return;
      }
      const data = { id: snap.id, ...snap.data() } as Order;
      // Auth guard: only the order owner can view it
      if (data.userId !== user.uid) {
        setAccessDenied(true);
        setOrderLoading(false);
        return;
      }
      setOrder(data);
      setOrderLoading(false);
    });

    return unsubscribe;
  }, [orderId, user]);

  if (authLoading || orderLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (accessDenied || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p
          className="text-lg"
          style={{
            fontFamily: "var(--font-bangers, Bangers, cursive)",
            letterSpacing: "0.06em",
            color: "#0D0D0D",
          }}
        >
          ORDER NOT FOUND
        </p>
        <Link href={ROUTES.ACCOUNT_ORDERS} className="mt-4 inline-block text-sm font-bold hover:underline" style={{ color: "#E8001C" }}>
          View my orders
        </Link>
      </div>
    );
  }

  const showTracking = SHIPPED_STATUSES.includes(order.currentStatus);
  const date = order.createdAt
    ? new Date((order.createdAt as { seconds: number }).seconds * 1000).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-mono" style={{ color: "#6B6B6B" }}>Order #{order.id}</p>
          <h1
            className="mt-0.5"
            style={{
              fontFamily: "var(--font-bangers, Bangers, cursive)",
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              letterSpacing: "0.06em",
              color: "#0D0D0D",
            }}
          >
            TRACK ORDER
          </h1>
          {date && <p className="text-sm" style={{ color: "#6B6B6B" }}>Placed on {date}</p>}
        </div>
        <OrderStatusBadge status={order.currentStatus} />
      </div>

      {/* Tracking banner (courier + AWB) */}
      {showTracking && (
        <div className="mb-6">
          <TrackingBanner
            courierName={order.courierName}
            trackingNumber={order.trackingNumber}
            trackingUrl={order.trackingUrl}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        {/* Status stepper — takes 2/5 cols */}
        <div className="md:col-span-2">
          <div
            className="p-5"
            style={{
              border: "2px solid #0D0D0D",
              boxShadow: "3px 3px 0px #0D0D0D",
              background: "#FFFFFF",
            }}
          >
            <h2 className="mb-5 text-sm font-black uppercase tracking-widest" style={{ color: "#6B6B6B" }}>
              Status
            </h2>
            <OrderStatusStepper order={order} configs={configs} />
          </div>
        </div>

        {/* Order summary — takes 3/5 cols */}
        <div className="flex flex-col gap-5 md:col-span-3">
          {/* Items */}
          <div
            className="p-5"
            style={{
              border: "2px solid #0D0D0D",
              boxShadow: "3px 3px 0px #0D0D0D",
              background: "#FFFFFF",
            }}
          >
            <h2 className="mb-4 text-sm font-black uppercase tracking-widest" style={{ color: "#6B6B6B" }}>
              Items
            </h2>
            <OrderItemList items={order.items} />
          </div>

          {/* Totals */}
          <div
            className="p-5"
            style={{
              border: "2px solid #0D0D0D",
              boxShadow: "3px 3px 0px #0D0D0D",
              background: "#FFFFFF",
            }}
          >
            <h2 className="mb-4 text-sm font-black uppercase tracking-widest" style={{ color: "#6B6B6B" }}>
              Summary
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt style={{ color: "#6B6B6B" }}>Subtotal</dt>
                <dd>{formatINR(order.subtotal)}</dd>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-700">
                  <dt>Discount {order.discountCode ? `(${order.discountCode})` : ""}</dt>
                  <dd>− {formatINR(order.discountAmount)}</dd>
                </div>
              )}
              {order.coinsRedeemed > 0 && (
                <div className="flex justify-between text-amber-700">
                  <dt>HC Coins</dt>
                  <dd>− {formatINR(order.coinsRedeemed)}</dd>
                </div>
              )}
              <div className="flex justify-between pt-2 font-black" style={{ borderTop: "2px solid #0D0D0D" }}>
                <dt>Total</dt>
                <dd style={{ color: "#E8001C" }}>{formatINR(order.total)}</dd>
              </div>
            </dl>
          </div>

          {/* Delivery address */}
          <div
            className="p-5"
            style={{
              border: "2px solid #0D0D0D",
              boxShadow: "3px 3px 0px #0D0D0D",
              background: "#FFFFFF",
            }}
          >
            <h2 className="mb-3 text-sm font-black uppercase tracking-widest" style={{ color: "#6B6B6B" }}>
              Delivery Address
            </h2>
            <address className="not-italic text-sm leading-relaxed" style={{ color: "#1A1A2E" }}>
              <strong>{order.address.name}</strong>
              <br />
              {order.address.line1}
              {order.address.line2 && (
                <>
                  <br />
                  {order.address.line2}
                </>
              )}
              <br />
              {order.address.city}, {order.address.state} — {order.address.pincode}
              <br />
              {order.address.phone}
            </address>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link href={ROUTES.ACCOUNT_ORDERS} className="text-sm font-bold hover:underline" style={{ color: "#E8001C" }}>
          ← Back to my orders
        </Link>
      </div>
    </div>
  );
}
