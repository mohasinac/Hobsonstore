import type { Timestamp } from "firebase/firestore";
import type { Address } from "./order";

export type UserRole = "customer" | "admin";

export interface CoinHistoryEntry {
  delta: number;
  reason: "purchase" | "redemption" | "admin-grant" | "refund";
  orderId?: string;
  timestamp: Timestamp;
}

export interface User {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  hcCoins: number;
  coinHistory: CoinHistoryEntry[];
  addresses: (Address & { id: string; isDefault: boolean })[];
  wishlist: string[];
  role: UserRole;
  createdAt: Timestamp;
}
