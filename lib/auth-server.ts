import "server-only";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp, getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/firebase";
import type { NextRequest } from "next/server";

/**
 * Verifies a Firebase ID token from the Authorization: Bearer header and
 * confirms the caller has `role === "admin"` in the `users` collection.
 *
 * The check is performed server-side via the Admin SDK, so clients cannot
 * tamper with the result. This mirrors the admin layout gate.
 *
 * Returns the verified uid on success, or null on any failure.
 */
export async function verifyAdminToken(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  try {
    const decoded = await getAuth(getAdminApp()).verifyIdToken(token);
    const db = getAdminDb();
    const userSnap = await db.collection(COLLECTIONS.USERS).doc(decoded.uid).get();
    if (!userSnap.exists || userSnap.data()?.role !== "admin") return null;
    return decoded.uid;
  } catch {
    return null;
  }
}
