/**
 * onOrderWrite — Firebase Cloud Function
 *
 * Triggers on every write to `orders/{orderId}`.
 *
 * Responsibilities:
 *  - When `currentStatus` transitions TO "delivered":
 *      1. Award FCC Coins to the customer (based on `loyaltyConfig`).
 *      2. Release reserved stock for each order item.
 *  - When `currentStatus` transitions TO "cancelled":
 *      1. Release reserved stock for each order item.
 */

import * as functions from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";

if (!getApps().length) initializeApp();

const db = getFirestore();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function releaseReservedStock(
  items: Array<{ productId: string; qty: number }>,
): Promise<void> {
  const batch = db.batch();
  for (const item of items) {
    const ref = db.collection("products").doc(item.productId);
    batch.update(ref, {
      reservedStock: FieldValue.increment(-item.qty),
      availableStock: FieldValue.increment(item.qty),
    });
  }
  await batch.commit();
}

async function awardCoins(
  userId: string,
  orderId: string,
  orderTotal: number,
): Promise<void> {
  // Read loyalty config; fall back to 1 coin per ₹100 if not configured
  const configSnap = await db.collection("loyaltyConfig").doc("main").get();
  const config = configSnap.exists
    ? (configSnap.data() as { coinsPerRupee?: number; active?: boolean })
    : null;

  if (!config?.active) return;

  const coinsPerRupee = config.coinsPerRupee ?? 0.01; // 1 coin per ₹100
  const coinsEarned = Math.floor(orderTotal * coinsPerRupee);
  if (coinsEarned <= 0) return;

  const userRef = db.collection("users").doc(userId);
  await userRef.update({
    fccCoins: FieldValue.increment(coinsEarned),
    coinHistory: FieldValue.arrayUnion({
      delta: coinsEarned,
      reason: "purchase",
      orderId,
      timestamp: new Date().toISOString(),
    }),
  });

  logger.info("[onOrderWrite] Coins awarded", {
    userId,
    orderId,
    coinsEarned,
  });
}

// ---------------------------------------------------------------------------
// Function
// ---------------------------------------------------------------------------

export const onOrderWrite = functions.onDocumentWritten(
  "orders/{orderId}",
  async (event) => {
    const before = event.data?.before.data() as
      | {
          currentStatus?: string;
          userId?: string;
          total?: number;
          items?: Array<{ productId: string; qty: number }>;
        }
      | undefined;
    const after = event.data?.after.data() as
      | {
          currentStatus?: string;
          userId?: string;
          total?: number;
          items?: Array<{ productId: string; qty: number }>;
        }
      | undefined;

    if (!after) return; // Document deleted

    const prevStatus = before?.currentStatus;
    const newStatus = after.currentStatus;

    // Nothing to do if status unchanged
    if (prevStatus === newStatus) return;

    const orderId = event.params.orderId;
    const items = after.items ?? [];

    if (newStatus === "delivered") {
      // 1. Release reserved stock
      await releaseReservedStock(items);

      // 2. Award FCC Coins
      const userId = after.userId;
      const total = after.total ?? 0;
      if (userId) {
        await awardCoins(userId, orderId, total);
      }
    }

    if (newStatus === "cancelled") {
      await releaseReservedStock(items);
      logger.info("[onOrderWrite] Reserved stock released (cancelled)", {
        orderId,
      });
    }
  },
);
