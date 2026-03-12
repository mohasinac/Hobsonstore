import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy, getFirestore } from "firebase/firestore";
import { getFirebaseApp } from "./client";
import { COLLECTIONS } from "@/constants/firebase";
import type {
  SiteConfig,
  LoyaltyConfig,
  OrderStatusConfig,
} from "@/types/config";

function getDb() {
  return getFirestore(getFirebaseApp());
}

export async function getSiteConfig(): Promise<SiteConfig | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, COLLECTIONS.SITE_CONFIG, "main"));
  if (!snap.exists()) return null;
  return snap.data() as SiteConfig;
}

export async function getLoyaltyConfig(): Promise<LoyaltyConfig | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, COLLECTIONS.LOYALTY_CONFIG, "main"));
  if (!snap.exists()) return null;
  return snap.data() as LoyaltyConfig;
}

export async function getOrderStatusConfig(): Promise<OrderStatusConfig[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.ORDER_STATUS_CONFIG),
    orderBy("sortOrder", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as OrderStatusConfig);
}

// ─── Admin write functions ────────────────────────────────────────────────────

export async function updateSiteConfig(data: Partial<SiteConfig>): Promise<void> {
  const db = getDb();
  await setDoc(doc(db, COLLECTIONS.SITE_CONFIG, "main"), data, { merge: true });
}

export async function updateLoyaltyConfig(data: Partial<LoyaltyConfig>): Promise<void> {
  const db = getDb();
  await setDoc(doc(db, COLLECTIONS.LOYALTY_CONFIG, "main"), data, { merge: true });
}

export async function updateOrderStatusConfigEntry(
  status: string,
  data: Partial<OrderStatusConfig>,
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, COLLECTIONS.ORDER_STATUS_CONFIG, status), data);
}
