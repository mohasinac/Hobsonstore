import type { CartItem } from "@/types/cart";
import type { Address } from "@/types/order";
import { formatINR } from "@/lib/formatCurrency";
import { createHmac, timingSafeEqual } from "crypto";

export function buildCheckoutMessageURL(
  waNumber: string,
  cart: CartItem[],
  total: number,
  address: Address,
  isPreorder: boolean,
): string {
  const prefix = isPreorder ? "🔖 *PRE-ORDER*\n\n" : "";
  const lines = cart.map(
    (i) => `• ${i.name} ×${i.qty} — ${formatINR(i.salePrice * i.qty)}`,
  );
  const body = [
    `${prefix}Hi FatCat! I'd like to place an order:`,
    "",
    ...lines,
    "",
    `*Total: ${formatINR(total)}*`,
    "",
    `Deliver to: ${address.name}, ${address.line1}${address.line2 ? ", " + address.line2 : ""}, ${address.city} - ${address.pincode}`,
    `Phone: ${address.phone}`,
    "",
    "Please share payment details.",
  ].join("\n");
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(body)}`;
}

export function buildStatusNotificationURL(
  userPhone: string,
  template: string,
  vars: Record<string, string>,
): string {
  const body = template.replace(
    /\{(\w+)\}/g,
    (_, key: string) => vars[key] ?? `{${key}}`,
  );
  return `https://wa.me/${userPhone}?text=${encodeURIComponent(body)}`;
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const sigBuf = Buffer.from(signature, "hex");
  if (expectedBuf.length !== sigBuf.length) return false;
  return timingSafeEqual(expectedBuf, sigBuf);
}

export function isAdminNumber(
  incomingNumber: string,
  adminBotNumber: string,
): boolean {
  // Strip non-digit chars for comparison
  const clean = (n: string) => n.replace(/\D/g, "");
  return clean(incomingNumber) === clean(adminBotNumber);
}

export function buildHelpMessage(): string {
  return [
    "*FatCat Inventory Bot — Commands*",
    "",
    "`RESTOCK {sku} qty:{n}` — Add stock",
    "`SOLDOUT {sku}` — Mark as sold out",
    "`PREORDER {sku} date:{Q#-YYYY}` — Mark as pre-order",
    "`STATUS {orderId} {status} [awb:{n}]` — Update order status",
    "`STOCK {sku}` — Check current stock",
    "`HELP` — Show this message",
  ].join("\n");
}

/**
 * Parsed representation of an inbound WhatsApp webhook message.
 */
export interface IncomingWebhookPayload {
  /** Normalised phone number (digits only, no country-code prefix "+") */
  from: string;
  /** Raw message body text */
  body: string;
}

/**
 * Parse an inbound WhatsApp webhook POST body.
 *
 * Supports two formats:
 *  - Twilio (application/x-www-form-urlencoded): `From` + `Body` fields.
 *    The `From` value is stripped of the "whatsapp:" prefix.
 *  - Generic JSON: `{ from: string; body: string }` (Wati.io compatible).
 *
 * Returns `null` when the body cannot be meaningfully parsed.
 */
export function parseIncomingWebhook(
  rawBody: string,
  contentType: string,
): IncomingWebhookPayload | null {
  try {
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams(rawBody);
      const from = params.get("From") ?? "";
      const body = params.get("Body") ?? "";
      if (!from || !body) return null;
      return {
        from: from.replace(/^whatsapp:/i, "").replace(/\D/g, ""),
        body: body.trim(),
      };
    }

    // JSON format (Wati.io or generic)
    const json = JSON.parse(rawBody) as Record<string, unknown>;
    // Wati.io: { senderWaId, text: { body } }
    const from =
      typeof json.senderWaId === "string"
        ? json.senderWaId
        : typeof json.from === "string"
          ? json.from
          : "";
    const body =
      typeof (json.text as Record<string, unknown> | undefined)?.body ===
      "string"
        ? ((json.text as Record<string, unknown>).body as string)
        : typeof json.body === "string"
          ? json.body
          : "";

    if (!from || !body) return null;
    return { from: from.replace(/\D/g, ""), body: body.trim() };
  } catch {
    return null;
  }
}
