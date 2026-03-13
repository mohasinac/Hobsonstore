// app/api/admin/razorpay/oauth/disconnect/route.ts
// Revokes the Razorpay OAuth token (best-effort) and removes all OAuth fields
// from the integrationKeys Firestore document.

import { type NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { verifyAdminToken } from "@/lib/auth-server";
import { getAdminDb } from "@/lib/firebase/admin";
import { decrypt, isEncrypted } from "@/lib/encryption";
import { invalidateIntegrationKeysCache } from "@/lib/integration-keys";
import { COLLECTIONS } from "@/constants/firebase";

const RAZORPAY_REVOKE_URL = "https://auth.razorpay.com/revoke";

export async function DELETE(req: NextRequest) {
  const uid = await verifyAdminToken(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getAdminDb();
  const keysSnap = await db.collection(COLLECTIONS.INTEGRATION_KEYS).doc("main").get();
  const data = keysSnap.data() ?? {};

  // Best-effort: revoke the access token with Razorpay so it's invalidated server-side
  const rawAccessToken = data.razorpayAccessToken as string | undefined;
  if (rawAccessToken) {
    try {
      const accessToken = isEncrypted(rawAccessToken) ? decrypt(rawAccessToken) : rawAccessToken;
      const clientId = process.env.RAZORPAY_CLIENT_ID;
      const clientSecret = process.env.RAZORPAY_CLIENT_SECRET;

      if (clientId && clientSecret) {
        await fetch(RAZORPAY_REVOKE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
          },
          body: new URLSearchParams({
            token: accessToken,
            token_type_hint: "access_token",
          }),
        });
      }
    } catch (err) {
      // Non-fatal — we still remove the tokens locally
      console.warn("[razorpay oauth] token revocation failed (non-fatal):", err);
    }
  }

  // Remove all OAuth fields from Firestore
  await db.collection(COLLECTIONS.INTEGRATION_KEYS).doc("main").update({
    razorpayAccessToken: FieldValue.delete(),
    razorpayRefreshToken: FieldValue.delete(),
    razorpayPublicToken: FieldValue.delete(),
    razorpayTokenExpiresAt: FieldValue.delete(),
    razorpayAccountId: FieldValue.delete(),
  });

  invalidateIntegrationKeysCache();
  return NextResponse.json({ ok: true });
}
