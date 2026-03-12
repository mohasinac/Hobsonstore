"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getOrder } from "@/lib/firebase/orders";
import { OrderItemList } from "@/components/order/OrderItemList";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { Spinner } from "@/components/ui/Spinner";
import { formatINR } from "@/lib/formatCurrency";
import { ROUTES } from "@/constants/routes";
import type { Order } from "@/types/order";

export default function OrderDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    if (user && params.orderId) {
      getOrder(params.orderId)
        .then((o) => {
          if (!o || o.userId !== user.uid) {
            setNotFound(true);
          } else {
            setOrder(o);
          }
        })
        .catch(() => setNotFound(true))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router, params.orderId]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-bold" style={{ color: '#1A1A2E' }}>Order not found.</p>
        <Link href={ROUTES.ACCOUNT_ORDERS} className="mt-3 inline-block text-sm font-bold hover:underline" style={{ color: '#E8001C' }}>
          Back to orders
        </Link>
      </div>
    );
  }

  const { address } = order;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href={ROUTES.ACCOUNT_ORDERS} className="text-sm font-semibold hover:underline" style={{ color: '#6B6B6B' }}>
            ← My Orders
          </Link>
          <h1 className="mt-1 text-xl font-extrabold" style={{ fontFamily: 'var(--font-bangers)', color: '#1A1A2E', letterSpacing: '0.06em' }}>
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm" style={{ color: '#6B6B6B' }}>
            {order.createdAt?.toDate
              ? order.createdAt.toDate().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : ""}
          </p>
        </div>
        <OrderStatusBadge status={order.currentStatus} />
      </div>

      {/* Items */}
      <div className="bg-white" style={{ border: '2px solid #0D0D0D', boxShadow: '3px 3px 0px #0D0D0D' }}>
        <div className="px-5 py-3" style={{ borderBottom: '2px solid #0D0D0D' }}>
          <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#6B6B6B' }}>Items</h2>
        </div>
        <OrderItemList items={order.items} />
      </div>

      {/* Totals + Address row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Order summary */}
        <div className="bg-white p-5" style={{ border: '2px solid #0D0D0D', boxShadow: '3px 3px 0px #0D0D0D' }}>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest" style={{ color: '#6B6B6B' }}>
            Price Breakdown
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt style={{ color: '#6B6B6B' }}>Subtotal</dt>
              <dd>{formatINR(order.subtotal)}</dd>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-700">
                <dt>Discount {order.discountCode ? `(${order.discountCode})` : ""}</dt>
                <dd>−{formatINR(order.discountAmount)}</dd>
              </div>
            )}
            {order.coinsRedeemed > 0 && (
              <div className="flex justify-between text-amber-700">
                <dt>HC Coins</dt>
                <dd>−{formatINR(order.coinsRedeemed / 10)}</dd>
              </div>
            )}
            <div className="flex justify-between pt-2 font-bold" style={{ borderTop: '2px solid #0D0D0D' }}>
              <dt>Total</dt>
              <dd>{formatINR(order.total)}</dd>
            </div>
          </dl>
        </div>

        {/* Shipping address */}
        <div className="bg-white p-5" style={{ border: '2px solid #0D0D0D', boxShadow: '3px 3px 0px #0D0D0D' }}>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest" style={{ color: '#6B6B6B' }}>
            Shipping Address
          </h2>
          <address className="not-italic text-sm leading-relaxed" style={{ color: '#1A1A2E' }}>
            <strong>{address.name}</strong>
            <br />
            {address.phone}
            <br />
            {address.line1}
            {address.line2 && <>, {address.line2}</>}
            <br />
            {address.city}, {address.state} — {address.pincode}
          </address>
        </div>
      </div>

      {/* Tracking */}
      {order.trackingNumber && (
        <div className="bg-white p-5" style={{ border: '2px solid #0D0D0D', boxShadow: '3px 3px 0px #0D0D0D' }}>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-widest" style={{ color: '#6B6B6B' }}>
            Tracking
          </h2>
          <p className="text-sm" style={{ color: '#1A1A2E' }}>
            <span className="font-medium">{order.courierName}</span> ·{" "}
            <span>{order.trackingNumber}</span>
          </p>
          {order.trackingUrl && (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-bold hover:underline"
              style={{ color: '#E8001C' }}
            >
              Track shipment →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
