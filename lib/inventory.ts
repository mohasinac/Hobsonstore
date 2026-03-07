/**
 * lib/inventory.ts
 *
 * Inventory-management helpers used by:
 *  - The WhatsApp inbound webhook command handlers
 *  - Cloud Functions that send passive low-stock/sold-out alerts to admin
 */

import type { OrderStatus } from "@/types/order";

// ---------------------------------------------------------------------------
// Command parse types
// ---------------------------------------------------------------------------

export interface RestockCommandParsed {
  sku: string;
  qty: number;
}

export interface PreorderCommandParsed {
  sku: string;
  shipDate: string;
}

export interface StatusCommandParsed {
  orderId: string;
  status: OrderStatus;
  awb?: string;
}

// ---------------------------------------------------------------------------
// Command parsers
// ---------------------------------------------------------------------------

/**
 * Parse a RESTOCK command: `RESTOCK {sku} qty:{n}`
 * Returns null when the message does not match.
 */
export function parseRestockCommand(
  body: string,
): RestockCommandParsed | null {
  // e.g. "RESTOCK SKU-123 qty:50"
  const match = /^RESTOCK\s+(\S+)\s+qty:(\d+)/i.exec(body.trim());
  if (!match) return null;
  const qty = parseInt(match[2]!, 10);
  if (isNaN(qty) || qty <= 0) return null;
  return { sku: match[1]!, qty };
}

/**
 * Parse a SOLDOUT command: `SOLDOUT {sku}`
 * Returns the sku string or null when the message does not match.
 */
export function parseSoldOutCommand(body: string): string | null {
  const match = /^SOLDOUT\s+(\S+)/i.exec(body.trim());
  return match ? match[1]! : null;
}

/**
 * Parse a PREORDER command: `PREORDER {sku} date:{Q#-YYYY}`
 * Returns null when the message does not match.
 */
export function parsePreorderCommand(
  body: string,
): PreorderCommandParsed | null {
  // e.g. "PREORDER SKU-123 date:Q3-2026"
  const match = /^PREORDER\s+(\S+)\s+date:(Q\d-\d{4})/i.exec(body.trim());
  if (!match) return null;
  return { sku: match[1]!, shipDate: match[2]! };
}

/**
 * Parse a STOCK command: `STOCK {sku}`
 * Returns the sku string or null when the message does not match.
 */
export function parseStockCommand(body: string): string | null {
  const match = /^STOCK\s+(\S+)/i.exec(body.trim());
  return match ? match[1]! : null;
}

/**
 * Parse a STATUS command: `STATUS {orderId} {status} [awb:{n}]`
 * Returns null when the message does not match or status is not a known OrderStatus.
 */
export function parseStatusCommand(
  body: string,
): StatusCommandParsed | null {
  // e.g. "STATUS ORD-456 shipped awb:9876543210"
  const match =
    /^STATUS\s+(\S+)\s+(\S+)(?:\s+awb:(\S+))?/i.exec(body.trim());
  if (!match) return null;

  const status = match[2]!.toLowerCase() as OrderStatus;
  const knownStatuses: OrderStatus[] = [
    "pending_payment",
    "payment_confirmed",
    "processing",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "refund_initiated",
  ];
  if (!knownStatuses.includes(status)) return null;

  return {
    orderId: match[1]!,
    status,
    awb: match[3],
  };
}

// ---------------------------------------------------------------------------
// Alert message builders (used by Cloud Functions)
// ---------------------------------------------------------------------------

/**
 * Build a WhatsApp alert message when a product reaches zero stock.
 */
export function buildSoldOutAlertMessage(
  productName: string,
  productId: string,
): string {
  return [
    `🚨 *SOLD OUT* — ${productName}`,
    `Product ID: ${productId}`,
    "",
    "All units have been reserved or sold.",
    "Reply with `PREORDER {sku} date:{Q#-YYYY}` to switch to pre-order,",
    "or `RESTOCK {sku} qty:{n}` when new stock arrives.",
  ].join("\n");
}

/**
 * Build a WhatsApp alert message when a product's available stock
 * drops to or below the low-stock threshold.
 */
export function buildLowStockAlertMessage(
  productName: string,
  productId: string,
  availableStock: number,
  threshold: number,
): string {
  return [
    `⚠️ *LOW STOCK* — ${productName}`,
    `Product ID: ${productId}`,
    "",
    `Only *${availableStock}* unit${availableStock === 1 ? "" : "s"} remaining (threshold: ${threshold}).`,
    "Reply with `RESTOCK {sku} qty:{n}` to add more stock.",
  ].join("\n");
}
