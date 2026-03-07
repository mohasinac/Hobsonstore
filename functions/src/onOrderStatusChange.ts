/**
 * onOrderStatusChange — Firebase Cloud Function (stub)
 *
 * Triggers on every write to `orders/{orderId}`. When `currentStatus` changes
 * and the new status has `notifyCustomer: true` in `orderStatusConfig`, this
 * function sends a WhatsApp notification to the customer.
 *
 * Full implementation in Phase 4.
 */

import * as functions from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";

if (!getApps().length) initializeApp();

const db = getFirestore();

export const onOrderStatusChange = functions.onDocumentUpdated(
  "orders/{orderId}",
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) return;

    const prevStatus = before.currentStatus as string;
    const newStatus = after.currentStatus as string;

    // Only act when status actually changed
    if (prevStatus === newStatus) return;

    // Look up notification config for the new status
    const configSnap = await db
      .collection("orderStatusConfig")
      .doc(newStatus)
      .get();

    if (!configSnap.exists) return;

    const config = configSnap.data() as {
      notifyCustomer?: boolean;
      waTemplate?: string;
      label?: string;
    };

    if (!config.notifyCustomer || !config.waTemplate) return;

    // Build the WhatsApp message by substituting template placeholders
    const customerPhone = (after.address as { phone?: string })?.phone ?? "";
    const trackingNumber = (after.trackingNumber as string | undefined) ?? "";
    const customerName = (after.address as { name?: string })?.name ?? "";
    const orderId = event.params.orderId;

    const message = config.waTemplate
      .replace(/\{orderId\}/g, orderId)
      .replace(/\{trackingNumber\}/g, trackingNumber)
      .replace(/\{customerName\}/g, customerName);

    const waUrl = `https://wa.me/${customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

    // TODO Phase 4: Use WhatsApp Business API (Twilio/Wati) to send proactively.
    // For now, log the URL so an admin can manually trigger from the dashboard.
    logger.info("[onOrderStatusChange] WA notification ready", {
      orderId,
      newStatus,
      waUrl,
    });
  },
);
