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

export interface PaymentSettings {
  razorpayEnabled: boolean;
  codEnabled: boolean;
  whatsappEnabled: boolean;
  codFee: number;
  razorpayKeyId?: string;
  /** UPI ID for WhatsApp payment flow */
  upiId?: string;
  /** QR code image URL (Firebase Storage) */
  upiQrUrl?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankAccountHolder?: string;
}

/** Firestore document shape for `settings/integrationKeys` — secrets stored AES-256-GCM encrypted. */
export interface IntegrationKeys {
  // Twilio (WhatsApp / SMS)
  twilioAccountSid?: string;
  twilioAuthToken?: string;      // encrypted
  twilioWhatsappFrom?: string;
  // WhatsApp misc
  whatsappNumber?: string;
  whatsappAdminBotNumber?: string;
  whatsappWebhookSecret?: string; // encrypted
  // Razorpay (Phase 8)
  razorpayKeyId?: string;         // encrypted
  razorpayKeySecret?: string;     // encrypted
  // Admin notifications
  adminEmails?: string;           // comma-separated
}

export interface ShippingSettings {
  freeShippingThreshold: number;
  gstPercent: number;
  codFee: number;
  shippingNote?: string;
}

export interface NavigationConfig {
  /** Slug list of franchises pinned to the top of the mega-menu */
  featuredFranchises: string[];
  /** Slug list of brands pinned to the top of the mega-menu */
  featuredBrands: string[];
  maxMegaMenuItems: number;
}
