"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOrder } from "@/lib/firebase/orders";
import { StatusChangeForm } from "@/components/admin/StatusChangeForm";
import { formatINR } from "@/lib/formatCurrency";
import type { Order, OrderStatus } from "@/types/order";

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ id }) => {
      getOrder(id).then((o) => {
        setOrder(o);
        setLoading(false);
      });
    });
  }, [params]);

  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (!order) return <p className="text-sm text-red-600">Order not found.</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="text-sm text-gray-500 hover:underline">← Orders</Link>
        <h1 className="text-xl font-bold text-gray-900">Order {order.id.slice(0, 8)}…</h1>
      </div>

      <section className="rounded-md border p-4 space-y-2">
        <h2 className="font-semibold text-gray-700">Customer</h2>
        <p className="text-sm">{order.address.name} — {order.address.phone}</p>
        <p className="text-sm text-gray-500">{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city}, {order.address.state} {order.address.pincode}</p>
      </section>

      <section className="rounded-md border p-4 space-y-2">
        <h2 className="font-semibold text-gray-700">Items</h2>
        <ul className="divide-y text-sm">
          {order.items.map((item) => (
            <li key={item.productId} className="flex justify-between py-2">
              <span>{item.name} × {item.qty}</span>
              <span>{formatINR(item.salePrice * item.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between text-sm border-t pt-2 font-medium">
          <span>Total</span>
          <span>{formatINR(order.total)}</span>
        </div>
      </section>

      <section className="rounded-md border p-4 space-y-4">
        <h2 className="font-semibold text-gray-700">Change Status</h2>
        <StatusChangeForm
          order={order}
          onSuccess={(newStatus: OrderStatus) => setOrder((prev) => prev ? { ...prev, currentStatus: newStatus } : prev)}
        />
      </section>

      <section className="rounded-md border p-4 space-y-2">
        <h2 className="font-semibold text-gray-700">Status History</h2>
        <ul className="space-y-1 text-sm text-gray-600">
          {order.statusHistory.slice().reverse().map((ev, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-medium capitalize">{ev.status}</span>
              {ev.note && <span className="text-gray-400">— {ev.note}</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
