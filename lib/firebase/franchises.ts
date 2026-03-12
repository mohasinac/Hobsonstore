import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseApp } from "./client";
import { COLLECTIONS } from "@/constants/firebase";
import type { Franchise } from "@/types/franchise";

function getDb() {
  return getFirestore(getFirebaseApp());
}

export async function getFranchise(slug: string): Promise<Franchise | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, COLLECTIONS.FRANCHISES, slug));
  if (!snap.exists()) return null;
  return snap.data() as Franchise;
}

export async function getAllFranchises(): Promise<Franchise[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.FRANCHISES),
    where("active", "==", true),
    orderBy("sortOrder", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Franchise);
}

// ─── Admin CRUD ───────────────────────────────────────────────────────────────

export async function getAllFranchisesAdmin(): Promise<Franchise[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.FRANCHISES),
    orderBy("sortOrder", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Franchise);
}

export async function upsertFranchise(
  slug: string,
  data: Omit<Franchise, "slug"> & { slug?: string },
): Promise<void> {
  const db = getDb();
  await setDoc(
    doc(db, COLLECTIONS.FRANCHISES, slug),
    { ...data, slug, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function deleteFranchise(slug: string): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(db, COLLECTIONS.FRANCHISES, slug));
}

export async function updateFranchiseOrder(
  slug: string,
  sortOrder: number,
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, COLLECTIONS.FRANCHISES, slug), { sortOrder });
}
