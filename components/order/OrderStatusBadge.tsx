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

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const color = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800";
  const label = STATUS_LABELS[status] ?? status;

  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
}
