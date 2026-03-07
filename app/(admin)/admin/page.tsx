"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllProductsAdmin } from "@/lib/firebase/products";
import { getAllOrdersAdmin } from "@/lib/firebase/orders";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { formatINR } from "@/lib/formatCurrency";
import type { Product } from "@/types/product";
import type { Order } from "@/types/order";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [revenue30d, setRevenue30d] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ products: prods }, { orders }] = await Promise.all([
        getAllProductsAdmin(200),
        getAllOrdersAdmin(undefined, 5),
      ]);
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const rev = orders
        .filter((o) => (o.createdAt as unknown as { toMillis(): number })?.toMillis?.() > thirtyDaysAgo)
        .reduce((sum, o) => sum + o.total, 0);
      setProducts(prods);
      setRecentOrders(orders);
      setRevenue30d(rev);
      setLoading(false);
    }
    load();
  }, []);

  const pendingOrders = recentOrders.filter((o) => o.currentStatus === "pending_payment" || o.currentStatus === "processing");
  const lowStock = products.filter((p) => p.availableStock <= p.lowStockThreshold);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading dashboard…</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <AdminStatCard title="Total Products" value={products.length} />
        <AdminStatCard title="Low Stock" value={lowStock.length} accent="red" />
        <AdminStatCard title="Pending Orders" value={pendingOrders.length} accent="amber" />
        <AdminStatCard title="Revenue (30d)" value={formatINR(revenue30d)} accent="green" />
      </div>

      {lowStock.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-700">Low Stock Products</h2>
            <Link href="/admin/products" className="text-xs text-red-600 hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-right">Available</th>
                  <th className="px-4 py-2 text-right">Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {lowStock.slice(0, 10).map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <Link href={`/admin/products/${p.id}`} className="text-red-600 hover:underline">{p.name}</Link>
                    </td>
                    <td className="px-4 py-2 text-right">{p.availableStock}</td>
                    <td className="px-4 py-2 text-right">{p.lowStockThreshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-700">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-red-600 hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-2 text-left">Order ID</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <Link href={`/admin/orders/${o.id}`} className="text-red-600 hover:underline font-mono text-xs">{o.id.slice(0, 8)}…</Link>
                  </td>
                    <td className="px-4 py-2">{o.address.name}</td>
                  <td className="px-4 py-2 text-right">{formatINR(o.total)}</td>
                  <td className="px-4 py-2">
                    <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize">{o.currentStatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
