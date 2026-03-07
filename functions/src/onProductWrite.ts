/**
 * onProductWrite — Firebase Cloud Function
 *
 * Triggers on every write to `products/{productId}`.
 *
 * Responsibilities:
 *  1. Recalculate `availableStock = stock - reservedStock` (never below 0).
 *  2. Set `inStock` flag based on `availableStock > 0`.
 *  3. Send a WhatsApp alert to the admin when:
 *     - `availableStock` drops to 0 (sold-out)
 *     - `availableStock` drops to/below the product's low-stock threshold
 */

import * as functions from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";

if (!getApps().length) initializeApp();

const db = getFirestore();

// ---------------------------------------------------------------------------
// Alert helpers (log-only in Phase 4 — wire to WA Business API in future)
// ---------------------------------------------------------------------------

function logSoldOutAlert(productName: string, productId: string): void {
  logger.warn("[onProductWrite] SOLD OUT alert", {
    productId,
    productName,
    message: `🚨 SOLD OUT — ${productName} (${productId}). All units reserved or sold.`,
  });
}

function logLowStockAlert(
  productName: string,
  productId: string,
  available: number,
  threshold: number,
): void {
  logger.warn("[onProductWrite] LOW STOCK alert", {
    productId,
    productName,
    available,
    threshold,
    message: `⚠️ LOW STOCK — ${productName} (${productId}): ${available} unit(s) left (threshold: ${threshold}).`,
  });
}

// ---------------------------------------------------------------------------
// Function
// ---------------------------------------------------------------------------

export const onProductWrite = functions.onDocumentWritten(
  "products/{productId}",
  async (event) => {
    const after = event.data?.after;

    // Document deleted — nothing to do
    if (!after?.exists) return;

    const data = after.data() as {
      name?: string;
      stock?: number;
      reservedStock?: number;
      availableStock?: number;
      inStock?: boolean;
      lowStockThreshold?: number;
    };

    const stock = Math.max(0, data.stock ?? 0);
    const reserved = Math.max(0, data.reservedStock ?? 0);
    const newAvailable = Math.max(0, stock - reserved);
    const newInStock = newAvailable > 0;

    const prevAvailable = data.availableStock ?? newAvailable;

    const productId = event.params.productId;
    const productName = data.name ?? productId;
    const threshold = data.lowStockThreshold ?? 5; // fallback — ideally read from siteConfig

    // Only update Firestore if the denormalized values have actually changed
    // to avoid an infinite trigger loop.
    if (newAvailable !== data.availableStock || newInStock !== data.inStock) {
      await db.collection("products").doc(productId).update({
        availableStock: newAvailable,
        inStock: newInStock,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    // --- Passive admin alerts ---

    // Sold-out: just hit 0 available
    if (prevAvailable > 0 && newAvailable === 0) {
      logSoldOutAlert(productName, productId);
      return;
    }

    // Low-stock: just crossed the threshold from above
    if (
      newAvailable > 0 &&
      newAvailable <= threshold &&
      (prevAvailable > threshold || prevAvailable === newAvailable)
    ) {
      // Only alert when stock actively decreased to the threshold zone
      if (prevAvailable > newAvailable) {
        logLowStockAlert(productName, productId, newAvailable, threshold);
      }
    }
  },
);
