/**
 * POST /api/webhooks/whatsapp
 *
 * Inbound WhatsApp bot webhook.
 * Security: HMAC-SHA256 signature verification + admin-number check.
 *
 * Supports Twilio (application/x-www-form-urlencoded) and
 * generic JSON webhook bodies (Wati.io compatible).
 *
 * Returns TwiML-compatible XML so Twilio can deliver replies inline.
 */
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import {
  verifyWebhookSignature,
  isAdminNumber,
  buildHelpMessage,
  parseIncomingWebhook,
} from "@/lib/whatsapp";
import {
  parseRestockCommand,
  parseSoldOutCommand,
  parsePreorderCommand,
  parseStockCommand,
  parseStatusCommand,
} from "@/lib/inventory";
import { getAdminDb } from "@/lib/firebase/admin";
import { updateOrderStatus } from "@/lib/firebase/orders.server";
import { COLLECTIONS } from "@/constants/firebase";
import { INVENTORY_COMMANDS } from "@/constants/whatsapp";
import { RESTOCK_NOTE_MAX_LEN } from "@/constants/inventory";
import type { Product } from "@/types/product";
import type { OrderStatus } from "@/types/order";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wrap a plain-text message in a Twilio TwiML response envelope. */
function twiml(message: string): NextResponse {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</Message></Response>`;
  return new NextResponse(xml, {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

/** Look up a product by its slugs (treated as the SKU). */
async function getProductBySku(
  sku: string,
): Promise<{ id: string; data: Product } | null> {
  const db = getAdminDb();
  const snap = await db
    .collection(COLLECTIONS.PRODUCTS)
    .where("slug", "==", sku.toLowerCase())
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  return { id: doc.id, data: doc.data() as Product };
}

// ---------------------------------------------------------------------------
// Command handlers
// ---------------------------------------------------------------------------

async function handleRestock(body: string): Promise<string> {
  const parsed = parseRestockCommand(body);
  if (!parsed) return "❌ Invalid syntax. Usage: `RESTOCK {sku} qty:{n}`";

  const product = await getProductBySku(parsed.sku);
  if (!product) return `❌ Product not found: ${parsed.sku}`;

  const db = getAdminDb();
  const ref = db.collection(COLLECTIONS.PRODUCTS).doc(product.id);

  const newStock = (product.data.stock ?? 0) + parsed.qty;
  const newAvailable = newStock - (product.data.reservedStock ?? 0);

  await ref.update({
    stock: newStock,
    availableStock: newAvailable,
    inStock: newAvailable > 0,
    lastRestockedAt: FieldValue.serverTimestamp(),
    restockHistory: FieldValue.arrayUnion({
      qty: parsed.qty,
      note: "WhatsApp bot restock".slice(0, RESTOCK_NOTE_MAX_LEN),
      restockedAt: new Date().toISOString(),
      restockedBy: "whatsapp-bot",
    }),
  });

  return `✅ Restocked *${product.data.name}* (+${parsed.qty} units). New stock: ${newStock}.`;
}

async function handleSoldOut(body: string): Promise<string> {
  const sku = parseSoldOutCommand(body);
  if (!sku) return "❌ Invalid syntax. Usage: `SOLDOUT {sku}`";

  const product = await getProductBySku(sku);
  if (!product) return `❌ Product not found: ${sku}`;

  const db = getAdminDb();
  await db.collection(COLLECTIONS.PRODUCTS).doc(product.id).update({
    stock: 0,
    availableStock: 0,
    inStock: false,
  });

  return `✅ Marked *${product.data.name}* as SOLD OUT.`;
}

async function handlePreorder(body: string): Promise<string> {
  const parsed = parsePreorderCommand(body);
  if (!parsed)
    return "❌ Invalid syntax. Usage: `PREORDER {sku} date:{Q#-YYYY}`";

  const product = await getProductBySku(parsed.sku);
  if (!product) return `❌ Product not found: ${parsed.sku}`;

  const db = getAdminDb();
  await db.collection(COLLECTIONS.PRODUCTS).doc(product.id).update({
    isPreorder: true,
    preorderShipDate: parsed.shipDate,
  });

  return `✅ *${product.data.name}* set to PRE-ORDER. ETA: ${parsed.shipDate}.`;
}

async function handleStatus(body: string): Promise<string> {
  const parsed = parseStatusCommand(body);
  if (!parsed)
    return "❌ Invalid syntax. Usage: `STATUS {orderId} {status} [awb:{n}]`";

  try {
    await updateOrderStatus(parsed.orderId, parsed.status as OrderStatus, "whatsapp-bot", {
      note: "Updated via WhatsApp bot",
      ...(parsed.awb ? { trackingNumber: parsed.awb } : {}),
    });
    return `✅ Order *${parsed.orderId}* updated to *${parsed.status}*${parsed.awb ? ` (AWB: ${parsed.awb})` : ""}.`;
  } catch {
    return `❌ Failed to update order *${parsed.orderId}*. Check the order ID and status.`;
  }
}

async function handleStock(body: string): Promise<string> {
  const sku = parseStockCommand(body);
  if (!sku) return "❌ Invalid syntax. Usage: `STOCK {sku}`";

  const product = await getProductBySku(sku);
  if (!product) return `❌ Product not found: ${sku}`;

  const { name, stock, reservedStock, availableStock, inStock } = product.data;
  return [
    `📦 *${name}*`,
    `Total stock: ${stock ?? 0}`,
    `Reserved: ${reservedStock ?? 0}`,
    `Available: ${availableStock ?? 0}`,
    `Status: ${inStock ? "✅ In Stock" : "❌ Sold Out"}`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Read raw body for HMAC verification
  const rawBody = await request.text();
  const contentType = request.headers.get("content-type") ?? "";

  // 2. Verify HMAC-SHA256 signature
  const secret = process.env.WHATSAPP_WEBHOOK_SECRET ?? "";
  const signature =
    request.headers.get("x-hub-signature-256") ??
    request.headers.get("x-twilio-signature") ??
    "";

  if (secret && !verifyWebhookSignature(rawBody, signature.replace(/^sha256=/i, ""), secret)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. Parse webhook payload
  const payload = parseIncomingWebhook(rawBody, contentType);
  if (!payload) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  // 4. Verify sender is the admin bot number
  const adminBotNumber = process.env.WHATSAPP_ADMIN_BOT_NUMBER ?? "";
  if (adminBotNumber && !isAdminNumber(payload.from, adminBotNumber)) {
    // Silently ignore messages from non-admin numbers
    return twiml("");
  }

  // 5. Dispatch command
  const upperBody = payload.body.toUpperCase().trimStart();
  let reply: string;

  if (upperBody.startsWith(INVENTORY_COMMANDS.RESTOCK)) {
    reply = await handleRestock(payload.body);
  } else if (upperBody.startsWith(INVENTORY_COMMANDS.SOLDOUT)) {
    reply = await handleSoldOut(payload.body);
  } else if (upperBody.startsWith(INVENTORY_COMMANDS.PREORDER)) {
    reply = await handlePreorder(payload.body);
  } else if (upperBody.startsWith(INVENTORY_COMMANDS.STATUS)) {
    reply = await handleStatus(payload.body);
  } else if (upperBody.startsWith(INVENTORY_COMMANDS.STOCK)) {
    reply = await handleStock(payload.body);
  } else if (upperBody.startsWith(INVENTORY_COMMANDS.HELP)) {
    reply = buildHelpMessage();
  } else {
    reply = `Unknown command. Send \`HELP\` for a list of available commands.`;
  }

  return twiml(reply);
}
