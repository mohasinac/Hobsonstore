import type { CartItem } from "@/types/cart";
import type { Address } from "@/types/order";
import type { OrderStatus } from "@/types/order";
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
    `${prefix}Hi Hobson! I'd like to place an order:`,
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
    "*Hobson Inventory Bot — Commands*",
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

// ─── Outbound messaging (Twilio REST API) ────────────────────────────────────

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  pending_payment:    "🛒 Your order #{id} has been received and is awaiting payment confirmation.",
  payment_confirmed:  "✅ Payment confirmed for order #{id}! We're getting it ready.",
  processing:         "📦 Your order #{id} is being packed and prepared for dispatch.",
  shipped:            "🚚 Your order #{id} is on its way!{tracking}",
  out_for_delivery:   "🏃 Your order #{id} is out for delivery today!",
  delivered:          "🎉 Order #{id} delivered! We hope you love your new collectible. Thank you for shopping with Hobson!",
  cancelled:          "❌ Your order #{id} has been cancelled. Contact us if you have any questions.",
  refund_initiated:   "💸 Refund initiated for order #{id}. It should reflect within 5–7 business days.",
};

export function buildStatusMessage(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string,
  courierName?: string,
): string {
  const template = STATUS_MESSAGES[status] ?? `Your order #${orderId} status updated to: ${status}.`;
  const trackingLine =
    trackingNumber
      ? `\nTracking: ${courierName ? courierName + " — " : ""}${trackingNumber}`
      : "";
  return template.replace("{id}", orderId).replace("{tracking}", trackingLine);
}

/**
 * Send an outbound WhatsApp message via Twilio REST API.
 * Silently no-ops when TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN are not set.
 * `toPhone` should be digits only (e.g. "919876543210").
 */
export async function sendWhatsAppMessage(
  toPhone: string,
  message: string,
): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const from       = process.env.TWILIO_WHATSAPP_FROM; // e.g. "whatsapp:+14155238886"

  if (!accountSid || !authToken || !from) return;

  const cleanPhone = toPhone.replace(/\D/g, "");
  if (!cleanPhone) return;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const body = new URLSearchParams({
    From: from,
    To: `whatsapp:+${cleanPhone}`,
    Body: message,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[whatsapp/send] Twilio error:", res.status, text);
  }
}
