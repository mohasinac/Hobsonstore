// Static fallback — overridden at runtime by Firestore `orderStatusConfig`
export const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending_payment: ["payment_confirmed", "cancelled"],
  payment_confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["out_for_delivery", "delivered"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: ["refund_initiated"],
  refund_initiated: [],
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending Payment",
  payment_confirmed: "Payment Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refund_initiated: "Refund Initiated",
};
