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
import type { Brand } from "@/types/brand";

function getDb() {
  return getFirestore(getFirebaseApp());
}

export async function getBrand(slug: string): Promise<Brand | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, COLLECTIONS.BRANDS, slug));
  if (!snap.exists()) return null;
  return snap.data() as Brand;
}

export async function getAllBrands(): Promise<Brand[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.BRANDS),
    where("active", "==", true),
    orderBy("sortOrder", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Brand);
}

// ─── Admin CRUD ───────────────────────────────────────────────────────────────

export async function getAllBrandsAdmin(): Promise<Brand[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.BRANDS),
    orderBy("sortOrder", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Brand);
}

export async function upsertBrand(
  slug: string,
  data: Omit<Brand, "slug"> & { slug?: string },
): Promise<void> {
  const db = getDb();
  await setDoc(
    doc(db, COLLECTIONS.BRANDS, slug),
    { ...data, slug, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function deleteBrand(slug: string): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(db, COLLECTIONS.BRANDS, slug));
}

export async function updateBrandOrder(
  slug: string,
  sortOrder: number,
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, COLLECTIONS.BRANDS, slug), { sortOrder });
}
