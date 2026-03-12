import { NextRequest, NextResponse } from "next/server";
import { getAdminApp, getAdminDb } from "@/lib/firebase/admin";
import { updateOrderStatus, releaseReservedStock, consumeReservedStock } from "@/lib/firebase/orders.server";
import { buildStatusMessage, sendWhatsAppMessage } from "@/lib/whatsapp";
import { ORDER_STATUS_TRANSITIONS } from "@/constants/orderStatus";
import { COLLECTIONS } from "@/constants/firebase";
import { calculateCoinsEarned } from "@/lib/loyalty";
import { FieldValue } from "firebase-admin/firestore";
import type { OrderStatus, Order } from "@/types/order";
import type { LoyaltyConfig } from "@/types/config";

interface StatusBody {
  newStatus: OrderStatus;
  note?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  courierName?: string;
}

async function awardCoinsForOrder(orderId: string): Promise<void> {
  const db = getAdminDb();
  const [orderSnap, configSnap] = await Promise.all([
    db.collection(COLLECTIONS.ORDERS).doc(orderId).get(),
    db.collection(COLLECTIONS.LOYALTY_CONFIG).doc("main").get(),
  ]);
  if (!orderSnap.exists || !configSnap.exists) return;

  const order = orderSnap.data() as Order;
  const config = configSnap.data() as LoyaltyConfig;
  if (!config.active || !order.userId || order.userId === "guest") return;

  const coinsEarned = calculateCoinsEarned(order.total, config);
  if (coinsEarned <= 0) return;

  await db.collection(COLLECTIONS.USERS).doc(order.userId).update({
    hcCoins: FieldValue.increment(coinsEarned),
    coinHistory: FieldValue.arrayUnion({
      delta: coinsEarned,
      reason: "purchase",
      orderId,
      timestamp: new Date().toISOString(),
    }),
  });
}

async function verifyAdminToken(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getAuth } = require("firebase-admin/auth");
    const decoded = await getAuth(getAdminApp()).verifyIdToken(token);

    // Check admin role in Firestore
    const db = getAdminDb();
    const userSnap = await db.collection(COLLECTIONS.USERS).doc(decoded.uid).get();
    if (!userSnap.exists) return null;
    const userData = userSnap.data() as { role?: string };
    if (userData.role !== "admin") return null;

    return decoded.uid;
  } catch {
    return null;
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminUid = await verifyAdminToken(req);
  if (!adminUid) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id: orderId } = await params;

  let body: StatusBody;
  try {
    body = (await req.json()) as StatusBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { newStatus, note, trackingNumber, trackingUrl, courierName } = body;
  if (!newStatus) {
    return NextResponse.json({ error: "newStatus is required." }, { status: 400 });
  }

  // Fetch current order status
  const db = getAdminDb();
  const orderSnap = await db.collection(COLLECTIONS.ORDERS).doc(orderId).get();
  if (!orderSnap.exists) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const order = orderSnap.data() as { currentStatus: OrderStatus };
  const validTransitions = ORDER_STATUS_TRANSITIONS[order.currentStatus] ?? [];
  if (!validTransitions.includes(newStatus)) {
    return NextResponse.json(
      { error: `Invalid transition: ${order.currentStatus} → ${newStatus}` },
      { status: 422 },
    );
  }

  try {
    await updateOrderStatus(orderId, newStatus, adminUid, {
      note,
      trackingNumber,
      trackingUrl,
      courierName,
    });

    // On delivery: items are shipped — clear reservation without restoring inventory.
    // On cancel: items return to available stock.
    if (newStatus === "delivered") {
      await consumeReservedStock(orderId);
    } else if (newStatus === "cancelled") {
      await releaseReservedStock(orderId);
    }

    // Award HC Coins on delivery
    if (newStatus === "delivered") {
      await awardCoinsForOrder(orderId);
    }

    // Notify customer on WhatsApp (no-op if Twilio not configured)
    const freshOrderSnap = await db.collection(COLLECTIONS.ORDERS).doc(orderId).get();
    if (freshOrderSnap.exists) {
      const freshOrder = freshOrderSnap.data() as { address: { phone: string } };
      const message = buildStatusMessage(
        orderId,
        newStatus,
        body.trackingNumber,
        body.courierName,
      );
      await sendWhatsAppMessage(freshOrder.address.phone, message).catch((e) =>
        console.error("[admin/orders/status] WA notify failed:", e),
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/orders/status] update failed:", err);
    return NextResponse.json({ error: "Failed to update order status." }, { status: 500 });
  }
}
