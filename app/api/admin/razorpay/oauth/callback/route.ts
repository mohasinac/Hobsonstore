// app/api/admin/razorpay/oauth/callback/route.ts
// Handles the browser redirect back from Razorpay after the user grants consent.
// Validates the state, exchanges the code for tokens, stores them encrypted, then
// redirects the admin back to the integrations settings page.

import { type NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { encrypt } from "@/lib/encryption";
import { invalidateIntegrationKeysCache } from "@/lib/integration-keys";
import { COLLECTIONS } from "@/constants/firebase";

const RAZORPAY_TOKEN_URL = "https://auth.razorpay.com/token";

interface RazorpayTokenResponse {
  access_token: string;
  refresh_token?: string;
  public_token?: string;
  expires_in?: number;
  razorpay_account_id?: string;
}

export async function GET(req: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const integrationsUrl = `${siteUrl}/admin/config/integrations`;

  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  // User denied access or provider returned an error
  if (oauthError) {
    return NextResponse.redirect(
      `${integrationsUrl}?razorpay_error=${encodeURIComponent(oauthError)}`,
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(`${integrationsUrl}?razorpay_error=missing_params`);
  }

  const db = getAdminDb();

  // Validate the state token
  const stateDoc = await db.collection("oauthStates").doc(state).get();
  if (!stateDoc.exists) {
    return NextResponse.redirect(`${integrationsUrl}?razorpay_error=invalid_state`);
  }

  const stateData = stateDoc.data()!;
  // One-time use — delete immediately regardless of outcome
  await db.collection("oauthStates").doc(state).delete();

  if (stateData.provider !== "razorpay" || (stateData.expiresAt as number) < Date.now()) {
    return NextResponse.redirect(`${integrationsUrl}?razorpay_error=state_expired`);
  }

  // Re-verify the admin's role hasn't been revoked since they initiated the flow
  const userSnap = await db.collection(COLLECTIONS.USERS).doc(stateData.uid as string).get();
  if (!userSnap.exists || userSnap.data()?.role !== "admin") {
    return NextResponse.redirect(`${integrationsUrl}?razorpay_error=unauthorized`);
  }

  const clientId = process.env.RAZORPAY_CLIENT_ID;
  const clientSecret = process.env.RAZORPAY_CLIENT_SECRET;
  const redirectUri = `${siteUrl}/api/admin/razorpay/oauth/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${integrationsUrl}?razorpay_error=missing_config`);
  }

  // Exchange the authorization code for tokens
  let tokenData: RazorpayTokenResponse;
  try {
    const resp = await fetch(RAZORPAY_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!resp.ok) {
      const body = await resp.text();
      console.error("[razorpay oauth] token exchange failed:", body);
      return NextResponse.redirect(`${integrationsUrl}?razorpay_error=token_exchange_failed`);
    }

    tokenData = (await resp.json()) as RazorpayTokenResponse;
  } catch (err) {
    console.error("[razorpay oauth] token exchange error:", err);
    return NextResponse.redirect(`${integrationsUrl}?razorpay_error=token_exchange_error`);
  }

  // Persist tokens — access & refresh are stored encrypted
  const updates: Record<string, string | number> = {
    razorpayAccessToken: encrypt(tokenData.access_token),
  };
  if (tokenData.refresh_token) {
    updates.razorpayRefreshToken = encrypt(tokenData.refresh_token);
  }
  if (tokenData.public_token) {
    // public_token is the key_id for client-side Razorpay Checkout — not a secret
    updates.razorpayPublicToken = tokenData.public_token;
  }
  if (tokenData.expires_in) {
    updates.razorpayTokenExpiresAt = Date.now() + tokenData.expires_in * 1000;
  }
  if (tokenData.razorpay_account_id) {
    updates.razorpayAccountId = tokenData.razorpay_account_id;
  }

  await db.collection(COLLECTIONS.INTEGRATION_KEYS).doc("main").set(updates, { merge: true });
  invalidateIntegrationKeysCache();

  return NextResponse.redirect(`${integrationsUrl}?razorpay_connected=1`);
}
