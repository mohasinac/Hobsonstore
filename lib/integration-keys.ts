// lib/integration-keys.ts
// Server-only helper that resolves live integration keys.
//
// Resolution priority:
//   1. Razorpay OAuth tokens (access_token from DB, auto-refreshed when expired)
//   2. Manual DB keys (razorpayKeyId / razorpayKeySecret, AES-256-GCM encrypted in Firestore)
//   3. Environment variables (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)
//
// All non-Razorpay keys follow: DB encrypted → env var.
// Results are process-cached for 60 s; call invalidateIntegrationKeysCache() after any write.

import { getIntegrationKeysServer, updateIntegrationKeysServer } from "@/lib/firebase/server";
import { encrypt, decrypt, isEncrypted } from "@/lib/encryption";

export interface ResolvedKeys {
  // Twilio (WhatsApp / SMS)
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioWhatsappFrom: string;
  // WhatsApp misc
  whatsappNumber: string;
  whatsappAdminBotNumber: string;
  whatsappWebhookSecret: string;
  // Razorpay — populated from whichever source wins in the priority chain
  /** key_id for client-side Razorpay Checkout (or the public_token when OAuth is used) */
  razorpayKeyId: string;
  /** key_secret for server-side API calls — empty string when OAuth Bearer auth is used instead */
  razorpayKeySecret: string;
  /**
   * OAuth Bearer access token.
   * Set when authenticated via OAuth; empty string when using manual API keys.
   * Use this as `Authorization: Bearer {razorpayAccessToken}` for server-side Razorpay API calls.
   */
  razorpayAccessToken: string;
  /** True when the Razorpay credentials come from the OAuth flow. */
  razorpayOAuthMode: boolean;
  // Admin notifications
  adminEmails: string[];
}

let _cache: { value: ResolvedKeys; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60_000; // 1 minute

/** Invalidates the in-process cache — call after admin saves new keys. */
export function invalidateIntegrationKeysCache(): void {
  _cache = null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeDecrypt(val: string | undefined): string {
  if (!val) return "";
  try {
    return isEncrypted(val) ? decrypt(val) : val;
  } catch {
    return val;
  }
}

function dbOrEnv(dbVal: string | undefined, envVal: string | undefined): string {
  const d = safeDecrypt(dbVal);
  return d || envVal || "";
}

function plainOrEnv(dbVal: string | undefined, envVal: string | undefined): string {
  return dbVal || envVal || "";
}

// ── OAuth token refresh ───────────────────────────────────────────────────────

interface RazorpayTokenResponse {
  access_token: string;
  refresh_token?: string;
  public_token?: string;
  expires_in?: number;
}

async function refreshOAuthToken(encryptedRefreshToken: string): Promise<string | null> {
  const clientId = process.env.RAZORPAY_CLIENT_ID;
  const clientSecret = process.env.RAZORPAY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const refreshToken = safeDecrypt(encryptedRefreshToken);
  if (!refreshToken) return null;

  try {
    const resp = await fetch("https://auth.razorpay.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!resp.ok) {
      console.error("[integration-keys] Razorpay token refresh failed:", await resp.text());
      return null;
    }

    const data = (await resp.json()) as RazorpayTokenResponse;

    // Persist refreshed tokens
    const updates: Record<string, string | number> = {
      razorpayAccessToken: encrypt(data.access_token),
    };
    if (data.refresh_token) updates.razorpayRefreshToken = encrypt(data.refresh_token);
    if (data.public_token) updates.razorpayPublicToken = data.public_token;
    if (data.expires_in) updates.razorpayTokenExpiresAt = Date.now() + data.expires_in * 1000;

    await updateIntegrationKeysServer(updates as Parameters<typeof updateIntegrationKeysServer>[0]);
    return data.access_token;
  } catch (err) {
    console.error("[integration-keys] Razorpay token refresh error:", err);
    return null;
  }
}

// ── Razorpay resolver (OAuth → DB keys → env vars) ───────────────────────────

async function resolveRazorpayCredentials(dbKeys: Awaited<ReturnType<typeof getIntegrationKeysServer>>): Promise<{
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayAccessToken: string;
  razorpayOAuthMode: boolean;
}> {
  const rawAccessToken = dbKeys.razorpayAccessToken;
  const rawRefreshToken = dbKeys.razorpayRefreshToken;
  const expiresAt = dbKeys.razorpayTokenExpiresAt ?? 0;
  const publicToken = dbKeys.razorpayPublicToken ?? "";

  // ── 1. OAuth path ──────────────────────────────────────────────────────────
  if (rawAccessToken) {
    const isExpired = expiresAt > 0 && expiresAt < Date.now() + 60_000; // refresh 1 min early

    let accessToken = isExpired ? null : safeDecrypt(rawAccessToken);

    if (!accessToken && rawRefreshToken) {
      // Token is expired or missing — try to refresh
      accessToken = await refreshOAuthToken(rawRefreshToken);
    }

    if (accessToken) {
      return {
        // public_token is the key_id for client-side Razorpay Checkout
        razorpayKeyId: publicToken,
        razorpayKeySecret: "", // not used with OAuth Bearer auth
        razorpayAccessToken: accessToken,
        razorpayOAuthMode: true,
      };
    }
    // Refresh failed — fall through to manual keys
    console.warn("[integration-keys] Razorpay OAuth tokens expired and refresh failed; falling back to manual keys");
  }

  // ── 2. Manual DB keys ──────────────────────────────────────────────────────
  const dbKeyId = safeDecrypt(dbKeys.razorpayKeyId);
  const dbKeySecret = safeDecrypt(dbKeys.razorpayKeySecret);
  if (dbKeyId && dbKeySecret) {
    return {
      razorpayKeyId: dbKeyId,
      razorpayKeySecret: dbKeySecret,
      razorpayAccessToken: "",
      razorpayOAuthMode: false,
    };
  }

  // ── 3. Environment variables ───────────────────────────────────────────────
  return {
    razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? "",
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? "",
    razorpayAccessToken: "",
    razorpayOAuthMode: false,
  };
}

// ── Main resolver ─────────────────────────────────────────────────────────────

/** Resolves all integration keys. Cached 60 s in process memory. */
export async function resolveKeys(): Promise<ResolvedKeys> {
  if (_cache && _cache.expiresAt > Date.now()) return _cache.value;

  const db = await getIntegrationKeysServer();
  const razorpay = await resolveRazorpayCredentials(db);

  const value: ResolvedKeys = {
    twilioAccountSid: plainOrEnv(db.twilioAccountSid, process.env.TWILIO_ACCOUNT_SID),
    twilioAuthToken: dbOrEnv(db.twilioAuthToken, process.env.TWILIO_AUTH_TOKEN),
    twilioWhatsappFrom: plainOrEnv(db.twilioWhatsappFrom, process.env.TWILIO_WHATSAPP_FROM),
    whatsappNumber: plainOrEnv(db.whatsappNumber, process.env.WHATSAPP_NUMBER),
    whatsappAdminBotNumber: plainOrEnv(db.whatsappAdminBotNumber, process.env.WHATSAPP_ADMIN_BOT_NUMBER),
    whatsappWebhookSecret: dbOrEnv(db.whatsappWebhookSecret, process.env.WHATSAPP_WEBHOOK_SECRET),
    ...razorpay,
    adminEmails: plainOrEnv(db.adminEmails, process.env.ADMIN_EMAILS)
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean),
  };

  _cache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
  return value;
}
