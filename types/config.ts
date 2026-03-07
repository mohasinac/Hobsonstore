import type { Timestamp } from "firebase/firestore";

export interface SiteLocation {
  city: string;
  address: string;
  phone: string;
  mapUrl: string;
  active: boolean;
}

export interface SiteConfig {
  siteName: string;
  siteTagline: string;
  logoUrl: string;
  faviconUrl: string;
  defaultOgImage: string;
  contactEmail: string;
  whatsappCustomerCare: string;
  whatsappStatues: string;
  whatsappAdminBot: string;
  phoneCustomerCare: string;
  facebookUrl: string;
  instagramUrl: string;
  supportHours: string;
  freeShippingMinimum: number;
  inventoryLowStockDefault: number;
  noIndexAdmin: boolean;
  footerCopyright: string;
  locations: SiteLocation[];
}

export interface LoyaltyConfig {
  coinsPerRupee: number;
  rupeePerCoin: number;
  minCoinsToRedeem: number;
  maxRedeemPercent: number;
  active: boolean;
}

export interface OrderStatusConfig {
  status: string;
  label: string;
  color: string;
  notifyCustomer: boolean;
  waTemplate: string;
  sortOrder: number;
}

export interface Discount {
  code: string;
  type: "percent" | "flat";
  value: number;
  minOrderValue?: number;
  maxUses?: number;
  usedCount: number;
  applicableCollections?: string[];
  expiresAt?: Timestamp;
  active: boolean;
}
