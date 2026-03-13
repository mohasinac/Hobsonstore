"use client";

import Link from "next/link";
import { formatINR } from "@/lib/formatCurrency";
import { ORDER_STATUS_LABELS } from "@/constants/orderStatus";
import type { Order } from "@/types/order";

interface OrderTableProps {
  orders: Order[];
  onStatusFilter?: (status: string) => void;
  statusFilter?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-700",
  payment_confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refund_initiated: "bg-pink-100 text-pink-700",
};

export function OrderTable({ orders, onStatusFilter, statusFilter }: OrderTableProps) {
  const statuses = Object.keys(ORDER_STATUS_LABELS);

  return (
    <div>
      {/* Filter row */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onStatusFilter?.("")}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            !statusFilter ? "dark:bg-white dark:text-black dark:border-white bg-gray-900 text-white border-gray-900" : "dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10 border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          All
        </button>
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStatusFilter?.(s)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === s
                ? "dark:bg-white dark:text-black dark:border-white bg-gray-900 text-white border-gray-900"
                : "dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10 border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {ORDER_STATUS_LABELS[s] ?? s}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="text-sm py-8 text-center" style={{ color: 'var(--color-muted)' }}>No orders found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--surface-warm)' }}>
              <tr>
                {["Order ID", "Customer", "Date", "Items", "Total", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const date = (order.createdAt as { toDate?: () => Date })?.toDate?.()?.toLocaleDateString("en-IN") ?? "—";
                return (
                  <tr key={order.id} className="border-t dark:hover:bg-white/5 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{order.id.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.address.name}</p>
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{order.address.phone}</p>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{date}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{order.items.length}</td>
                    <td className="px-4 py-3 font-medium">{formatINR(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[order.currentStatus] ?? "dark:bg-white/10 dark:text-slate-300 bg-gray-100 text-gray-700"}`}>
                        {ORDER_STATUS_LABELS[order.currentStatus] ?? order.currentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-xs text-blue-600 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
