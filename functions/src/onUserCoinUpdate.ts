/**
 * onUserCoinUpdate — Firebase Cloud Function
 *
 * Triggers on every update to `users/{userId}`.
 *
 * Responsibility: Guard against negative `fccCoins` balances.
 * If the balance drops below 0 (e.g., due to a race condition or
 * manual admin error), reset it to 0 and log a warning.
 */

import * as functions from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";

if (!getApps().length) initializeApp();

const db = getFirestore();

export const onUserCoinUpdate = functions.onDocumentUpdated(
  "users/{userId}",
  async (event) => {
    const before = event.data?.before.data() as
      | { fccCoins?: number }
      | undefined;
    const after = event.data?.after.data() as
      | { fccCoins?: number }
      | undefined;

    if (!after) return;

    const coinsBefore = before?.fccCoins ?? 0;
    const coinsAfter = after.fccCoins ?? 0;

    // Only act when fccCoins changed and went negative
    if (coinsBefore === coinsAfter || coinsAfter >= 0) return;

    const userId = event.params.userId;

    logger.warn(
      "[onUserCoinUpdate] Negative fccCoins detected — resetting to 0",
      { userId, coinsAfter },
    );

    await db.collection("users").doc(userId).update({ fccCoins: 0 });
  },
);
