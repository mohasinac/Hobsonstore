"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getUserOrders } from "@/lib/firebase/orders";
import { OrderCard } from "@/components/order/OrderCard";
import { Spinner } from "@/components/ui/Spinner";
import { ROUTES } from "@/constants/routes";
import type { Order } from "@/types/order";
import Link from "next/link";

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    if (user) {
      getUserOrders(user.uid)
        .then(setOrders)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-gray-900">My Orders</h1>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-lg font-medium text-gray-600">No orders yet</p>
          <Link
            href={ROUTES.COLLECTIONS}
            className="mt-3 inline-block text-sm text-red-600 hover:underline"
          >
            Start shopping →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white shadow-sm">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
