// app/api/admin/settings/integration-keys/route.ts
// GET  → returns masked key values (safe to display in admin UI)
// PATCH → encrypts and saves new key values to Firestore
// DELETE ?field=<name> → removes a single field

import { type NextRequest, NextResponse } from "next/server";
import { getAdminApp, getAdminDb } from "@/lib/firebase/admin";
import { getIntegrationKeysServer, updateIntegrationKeysServer } from "@/lib/firebase/server";
import { encrypt, maskKey, isEncrypted, decrypt } from "@/lib/encryption";
import { invalidateIntegrationKeysCache } from "@/lib/integration-keys";
import { COLLECTIONS } from "@/constants/firebase";
import type { IntegrationKeys } from "@/types/config";

// Fields that must be stored encrypted
const SECRET_FIELDS = new Set([
  "twilioAuthToken",
  "whatsappWebhookSecret",
  "razorpayKeyId",
  "razorpayKeySecret",
]);

const ALLOWED_PATCH_FIELDS = [
  "twilioAccountSid",
  "twilioAuthToken",
  "twilioWhatsappFrom",
  "whatsappNumber",
  "whatsappAdminBotNumber",
  "whatsappWebhookSecret",
  "razorpayKeyId",
  "razorpayKeySecret",
  "adminEmails",
] as const satisfies (keyof IntegrationKeys)[];

async function verifyAdminToken(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getAuth } = require("firebase-admin/auth");
    const decoded = await getAuth(getAdminApp()).verifyIdToken(token);
    const db = getAdminDb();
    const userSnap = await db.collection(COLLECTIONS.USERS).doc(decoded.uid).get();
    if (!userSnap.exists) return null;
    const userData = userSnap.data() as { role?: string };
    if (userData.role !== "admin") return null;
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const uid = await verifyAdminToken(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = await getIntegrationKeysServer();

  // Return masked values — never expose raw secrets to the browser
  const masked: Record<string, string | boolean | undefined> = {};
  for (const [key, value] of Object.entries(keys)) {
    if (typeof value !== "string") {
      masked[key] = value as string | boolean | undefined;
      continue;
    }
    if (SECRET_FIELDS.has(key) && value) {
      const plain = isEncrypted(value) ? decrypt(value) : value;
      masked[key] = maskKey(plain);
      masked[`${key}IsSet`] = true;
    } else {
      masked[key] = value;
    }
  }

  return NextResponse.json(masked);
}

export async function PATCH(req: NextRequest) {
  const uid = await verifyAdminToken(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Expected JSON object" }, { status: 400 });
  }

  const updates: Partial<IntegrationKeys> = {};

  for (const field of ALLOWED_PATCH_FIELDS) {
    const value = (body as Record<string, unknown>)[field];
    if (typeof value !== "string" || value === "") continue;
    // Skip masked placeholders — user didn't change the field
    if (value.includes("•")) continue;

    if (SECRET_FIELDS.has(field)) {
      updates[field] = encrypt(value);
    } else {
      updates[field] = value;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true, noChanges: true });
  }

  await updateIntegrationKeysServer(updates);
  invalidateIntegrationKeysCache();

  return NextResponse.json({ ok: true });
}

// DELETE ?field=<name> — remove a single integration key field
export async function DELETE(req: NextRequest) {
  const uid = await verifyAdminToken(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const field = req.nextUrl.searchParams.get("field");
  const allowed = [...ALLOWED_PATCH_FIELDS] as string[];

  if (!field || !allowed.includes(field)) {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 });
  }

  const { FieldValue } = await import("firebase-admin/firestore");
  await getAdminDb()
    .collection("settings")
    .doc("integrationKeys")
    .update({ [field]: FieldValue.delete() });

  invalidateIntegrationKeysCache();
  return NextResponse.json({ ok: true });
}
