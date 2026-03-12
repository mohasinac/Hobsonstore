import Link from "next/link";
import { formatINR } from "@/lib/formatCurrency";
import { ROUTES } from "@/constants/routes";
import type { Order } from "@/types/order";

interface OrderCardProps {
  order: Order;
}

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
    <div
      className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
      style={{
        background: "var(--surface-elevated)",
        border: "2px solid var(--border-ink)",
        boxShadow: "3px 3px 0px var(--border-ink)",
      }}
    >
      <div className="flex flex-col gap-1">
        <p className="text-xs font-mono" style={{ color: "var(--color-muted)" }}>#{order.id}</p>
        <p className="text-sm font-black" style={{ color: "var(--color-black)" }}>
          {formatINR(order.total)}
        </p>
        <p className="text-xs" style={{ color: "var(--color-muted)" }}>{date}</p>
      </div>

      <div className="flex items-center gap-3">
        <span
          className="px-3 py-1 text-xs font-black uppercase"
          style={{ border: "2px solid var(--border-ink)" }}
        >
          {statusLabel}
        </span>
        <Link
          href={ROUTES.ORDER_TRACK(order.id)}
          className="text-xs font-black uppercase hover:underline"
          style={{ color: "var(--color-red)", letterSpacing: "0.04em" }}
        >
          Track →
        </Link>
      </div>
    </div>
  );
}
