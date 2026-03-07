import Link from "next/link";
import { formatINR } from "@/lib/formatCurrency";
import { ROUTES } from "@/constants/routes";
import type { Order } from "@/types/order";

interface OrderCardProps {
  order: Order;
}

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-800",
  payment_confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  out_for_delivery: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refund_initiated: "bg-orange-100 text-orange-800",
};

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending Payment",
  payment_confirmed: "Payment Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refund_initiated: "Refund Initiated",
};

export function OrderCard({ order }: OrderCardProps) {
  const statusColor =
    STATUS_COLORS[order.currentStatus] ?? "bg-gray-100 text-gray-800";
  const statusLabel =
    STATUS_LABELS[order.currentStatus] ?? order.currentStatus;
  const date = order.createdAt
    ? new Date(
        (order.createdAt as { seconds: number }).seconds * 1000,
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-mono text-gray-500">#{order.id}</p>
        <p className="text-sm font-semibold text-gray-900">
          {formatINR(order.total)}
        </p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>

      <div className="flex items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>
          {statusLabel}
        </span>
        <Link
          href={ROUTES.ORDER_TRACK(order.id)}
          className="text-xs font-medium text-red-600 hover:underline"
        >
          Track
        </Link>
      </div>
    </div>
  );
}
