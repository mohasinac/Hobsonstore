const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  pending_payment: { bg: "#FFE500", color: "#0D0D0D", border: "#0D0D0D" },
  payment_confirmed: { bg: "#0057FF", color: "#FFFFFF", border: "#0D0D0D" },
  processing: { bg: "#0057FF", color: "#FFFFFF", border: "#0D0D0D" },
  shipped: { bg: "#6B46C1", color: "#FFFFFF", border: "#0D0D0D" },
  out_for_delivery: { bg: "#9333EA", color: "#FFFFFF", border: "#0D0D0D" },
  delivered: { bg: "#16A34A", color: "#FFFFFF", border: "#0D0D0D" },
  cancelled: { bg: "#E8001C", color: "#FFFFFF", border: "#0D0D0D" },
  refund_initiated: { bg: "#EA580C", color: "#FFFFFF", border: "#0D0D0D" },
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

const FALLBACK_STYLE = { bg: "#FFFEF0", color: "#1A1A2E", border: "#0D0D0D" };

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const s = STATUS_STYLES[status] ?? FALLBACK_STYLE;
  const label = STATUS_LABELS[status] ?? status;

  return (
    <span
      className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider"
      style={{
        background: s.bg,
        color: s.color,
        border: `2px solid ${s.border}`,
        boxShadow: "2px 2px 0px #0D0D0D",
      }}
    >
      {label}
    </span>
  );
}
