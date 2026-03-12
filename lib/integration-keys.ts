// lib/integration-keys.ts
// Server-only helper that resolves live integration keys.
// Priority: Firestore `settings/integrationKeys` (decrypted) → environment variables.
// Results are cached in process memory for 60 seconds to avoid Firestore reads on every request.

import { getIntegrationKeysServer } from "@/lib/firebase/server";
import { decrypt } from "@/lib/encryption";

export interface ResolvedKeys {
  // Twilio (WhatsApp / SMS)
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioWhatsappFrom: string;
  // WhatsApp misc
  whatsappNumber: string;
  whatsappAdminBotNumber: string;
  whatsappWebhookSecret: string;
  // Razorpay (Phase 8)
  razorpayKeyId: string;
  razorpayKeySecret: string;
  // Admin notifications
  adminEmails: string[];
}

let _cache: { value: ResolvedKeys; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60_000; // 1 minute

/** Invalidates the in-process cache — call after admin saves new keys. */
export function invalidateIntegrationKeysCache(): void {
  _cache = null;
}

function dbOrEnv(dbVal: string | undefined, envVal: string | undefined): string {
  if (dbVal) {
    try {
      return decrypt(dbVal);
    } catch {
      return dbVal;
    }
  }
  return envVal ?? "";
}

function plainOrEnv(dbVal: string | undefined, envVal: string | undefined): string {
  return dbVal || envVal || "";
}

/** Resolves all integration keys from DB (with env fallback). Cached 60 s. */
export async function resolveKeys(): Promise<ResolvedKeys> {
  if (_cache && _cache.expiresAt > Date.now()) return _cache.value;

  const db = await getIntegrationKeysServer();

  const value: ResolvedKeys = {
    twilioAccountSid: plainOrEnv(db.twilioAccountSid, process.env.TWILIO_ACCOUNT_SID),
    twilioAuthToken: dbOrEnv(db.twilioAuthToken, process.env.TWILIO_AUTH_TOKEN),
    twilioWhatsappFrom: plainOrEnv(db.twilioWhatsappFrom, process.env.TWILIO_WHATSAPP_FROM),
    whatsappNumber: plainOrEnv(db.whatsappNumber, process.env.WHATSAPP_NUMBER),
    whatsappAdminBotNumber: plainOrEnv(db.whatsappAdminBotNumber, process.env.WHATSAPP_ADMIN_BOT_NUMBER),
    whatsappWebhookSecret: dbOrEnv(db.whatsappWebhookSecret, process.env.WHATSAPP_WEBHOOK_SECRET),
    razorpayKeyId: dbOrEnv(db.razorpayKeyId, process.env.RAZORPAY_KEY_ID),
    razorpayKeySecret: dbOrEnv(db.razorpayKeySecret, process.env.RAZORPAY_KEY_SECRET),
    adminEmails: plainOrEnv(db.adminEmails, process.env.ADMIN_EMAILS)
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean),
  };

  _cache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
  return value;
}
