import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  query,
  orderBy,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseApp } from "./client";
import { COLLECTIONS } from "@/constants/firebase";
import type { Discount } from "@/types/config";

function getDb() {
  return getFirestore(getFirebaseApp());
}

export async function getDiscount(code: string): Promise<Discount | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, COLLECTIONS.DISCOUNTS, code.toUpperCase()));
  if (!snap.exists()) return null;
  return snap.data() as Discount;
}

export async function getAllDiscounts(): Promise<Discount[]> {
  const db = getDb();
  const q = query(collection(db, COLLECTIONS.DISCOUNTS), orderBy("code", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Discount);
}

/**
 * Validate a discount code and return the discount if valid.
 * Returns null if invalid, expired, or usage limit reached.
 */
export async function validateDiscount(
  code: string,
  orderTotal: number,
): Promise<Discount | null> {
  const discount = await getDiscount(code);
  if (!discount || !discount.active) return null;

  if (discount.expiresAt) {
    // Firestore Timestamp — compare using .toDate()
    const expiry = (discount.expiresAt as { toDate: () => Date }).toDate();
    if (expiry < new Date()) return null;
  }

  if (discount.maxUses !== undefined && discount.usedCount >= discount.maxUses) {
    return null;
  }

  if (discount.minOrderValue !== undefined && orderTotal < discount.minOrderValue) {
    return null;
  }

  return discount;
}

export async function incrementDiscountUsage(code: string): Promise<void> {
  const db = getDb();
  await runTransaction(db, async (tx) => {
    const ref = doc(db, COLLECTIONS.DISCOUNTS, code.toUpperCase());
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const data = snap.data() as Discount;
    if (data.maxUses !== undefined && data.usedCount >= data.maxUses) {
      throw new Error("Discount usage limit reached");
    }
    tx.update(ref, { usedCount: data.usedCount + 1 });
  });
}

// ─── Admin CRUD ───────────────────────────────────────────────────────────────

export async function upsertDiscount(code: string, data: Omit<Discount, "code" | "usedCount"> & { usedCount?: number }): Promise<void> {
  const db = getDb();
  await setDoc(
    doc(db, COLLECTIONS.DISCOUNTS, code.toUpperCase()),
    { ...data, code: code.toUpperCase(), usedCount: data.usedCount ?? 0, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function deleteDiscount(code: string): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(db, COLLECTIONS.DISCOUNTS, code.toUpperCase()));
}

export async function toggleDiscount(code: string, active: boolean): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, COLLECTIONS.DISCOUNTS, code.toUpperCase()), { active });
}
