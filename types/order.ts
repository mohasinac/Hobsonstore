import type { Timestamp } from "firebase/firestore";

export type OrderStatus =
  | "pending_payment"
  | "payment_confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refund_initiated";

export interface Address {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  slug: string;
  qty: number;
  salePrice: number;
}

export interface OrderStatusEvent {
  status: OrderStatus;
  timestamp: Timestamp;
  note?: string;
  updatedBy: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  coinsRedeemed: number;
  coinsDiscount: number;
  discountCode?: string;
  discountAmount: number;
  total: number;
  address: Address;
  isPreorder: boolean;
  currentStatus: OrderStatus;
  statusHistory: OrderStatusEvent[];
  trackingNumber?: string;
  trackingUrl?: string;
  courierName?: string;
  whatsappSent: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
