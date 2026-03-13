// app/api/admin/razorpay/oauth/connect/route.ts
// Returns a Razorpay OAuth authorization URL for the admin to redirect to.
// State is persisted in Firestore (oauthStates/{state}) with a 10-minute TTL.

import { type NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { verifyAdminToken } from "@/lib/auth-server";
import { getAdminDb } from "@/lib/firebase/admin";

const RAZORPAY_AUTH_URL = "https://auth.razorpay.com/authorize";
const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function GET(req: NextRequest) {
  const uid = await verifyAdminToken(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = process.env.RAZORPAY_CLIENT_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!clientId) {
    return NextResponse.json(
      { error: "RAZORPAY_CLIENT_ID is not configured" },
      { status: 500 },
    );
  }
  if (!siteUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_SITE_URL is not configured" },
      { status: 500 },
    );
  }

  // Generate a cryptographically random state token
  const state = randomBytes(32).toString("hex");

  // Persist state → admin uid mapping so the callback can verify identity
  await getAdminDb().collection("oauthStates").doc(state).set({
    uid,
    provider: "razorpay",
    expiresAt: Date.now() + STATE_TTL_MS,
  });

  const redirectUri = `${siteUrl}/api/admin/razorpay/oauth/callback`;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "read_write",
    state,
  });

  return NextResponse.json({ url: `${RAZORPAY_AUTH_URL}?${params}` });
}
