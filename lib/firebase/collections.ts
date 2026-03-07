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
import type { Collection } from "@/types/content";

function getDb() {
  return getFirestore(getFirebaseApp());
}

export async function getCollection(slug: string): Promise<Collection | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, COLLECTIONS.COLLECTIONS, slug));
  if (!snap.exists()) return null;
  return snap.data() as Collection;
}

export async function getAllCollections(): Promise<Collection[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.COLLECTIONS),
    where("active", "==", true),
    orderBy("sortOrder", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Collection);
}

export async function getActiveCollectionsByType(
  type: "franchise" | "brand",
): Promise<Collection[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.COLLECTIONS),
    where("type", "==", type),
    where("active", "==", true),
    orderBy("sortOrder", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Collection);
}

// ─── Admin CRUD ───────────────────────────────────────────────────────────────

export async function getAllCollectionsAdmin(): Promise<Collection[]> {
  const db = getDb();
  const q = query(collection(db, COLLECTIONS.COLLECTIONS), orderBy("sortOrder", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Collection);
}

export async function upsertCollection(slug: string, data: Omit<Collection, "slug"> & { slug?: string }): Promise<void> {
  const db = getDb();
  await setDoc(doc(db, COLLECTIONS.COLLECTIONS, slug), { ...data, slug, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deleteCollection(slug: string): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(db, COLLECTIONS.COLLECTIONS, slug));
}

export async function updateCollectionOrder(slug: string, sortOrder: number): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, COLLECTIONS.COLLECTIONS, slug), { sortOrder });
}
