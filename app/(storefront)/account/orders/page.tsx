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
      <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'var(--font-bangers)', color: '#1A1A2E', letterSpacing: '0.06em' }}>My Orders</h1>

      {orders.length === 0 ? (
        <div className="py-16 text-center" style={{ border: '2px dashed #0D0D0D' }}>
          <p className="text-lg font-bold" style={{ color: '#1A1A2E' }}>No orders yet</p>
          <Link
            href={ROUTES.COLLECTIONS}
            className="mt-3 inline-block text-sm text-red-600 hover:underline"
          >
            Start shopping →
          </Link>
        </div>
      ) : (
        <div className="divide-y bg-white" style={{ border: '2px solid #0D0D0D', boxShadow: '3px 3px 0px #0D0D0D', borderColor: '#0D0D0D' }}>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
