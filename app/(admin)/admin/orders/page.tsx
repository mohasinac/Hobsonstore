"use client";

import { useEffect, useState } from "react";
import { getAllOrdersAdmin } from "@/lib/firebase/orders";
import { OrderTable } from "@/components/admin/OrderTable";
import type { Order } from "@/types/order";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllOrdersAdmin(undefined, 100).then(({ orders: o }) => {
      setOrders(o);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Orders</h1>
      {loading ? <p className="text-sm text-gray-500">Loading…</p> : <OrderTable orders={orders} />}
    </div>
  );
}
