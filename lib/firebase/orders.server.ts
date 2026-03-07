/**
 * Server-only order mutations using Firebase Admin SDK.
 * This file must NEVER be imported by client components.
 * Import path: @/lib/firebase/orders.server
 */
import "server-only";
import { getAdminDb } from "./admin";
import { FieldValue } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/constants/firebase";
import type { Order, OrderStatus } from "@/types/order";

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  updatedBy: string,
  options?: {
    note?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    courierName?: string;
  },
): Promise<void> {
  const adminDb = getAdminDb();
  const ref = adminDb.collection(COLLECTIONS.ORDERS).doc(orderId);

  const updateData: Record<string, unknown> = {
    currentStatus: newStatus,
    updatedAt: FieldValue.serverTimestamp(),
    statusHistory: FieldValue.arrayUnion({
      status: newStatus,
      timestamp: FieldValue.serverTimestamp(),
      ...(options?.note ? { note: options.note } : {}),
      updatedBy,
    }),
  };
  if (options?.trackingNumber) updateData.trackingNumber = options.trackingNumber;
  if (options?.trackingUrl) updateData.trackingUrl = options.trackingUrl;
  if (options?.courierName) updateData.courierName = options.courierName;

  await ref.update(updateData);
}

export async function releaseReservedStock(orderId: string): Promise<void> {
  const adminDb = getAdminDb();

  const orderSnap = await adminDb.collection(COLLECTIONS.ORDERS).doc(orderId).get();
  if (!orderSnap.exists) return;

  const order = orderSnap.data() as Order;
  const batch = adminDb.batch();

  for (const item of order.items) {
    const productRef = adminDb.collection(COLLECTIONS.PRODUCTS).doc(item.productId);
    batch.update(productRef, {
      reservedStock: FieldValue.increment(-item.qty),
      availableStock: FieldValue.increment(item.qty),
    });
  }

  await batch.commit();
}
