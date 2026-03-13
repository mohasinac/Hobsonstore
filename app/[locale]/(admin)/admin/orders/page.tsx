"use client";

import { useEffect, useState } from "react";
import { getAllOrdersAdmin } from "@/lib/firebase/orders";
import { OrderTable } from "@/components/admin/OrderTable";
import type { Order } from "@/types/order";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllOrdersAdmin(undefined, 100)
      .then(({ orders: o }) => {
        setOrders(o);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--color-black)' }}>Orders</h1>
      {loading ? <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading…</p> : <OrderTable orders={orders} />}
    </div>
  );
}
