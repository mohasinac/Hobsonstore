import { doc, getDoc, getFirestore } from "firebase/firestore";
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
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { collection, getDocs, query, orderBy } = require("firebase/firestore");
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.ORDER_STATUS_CONFIG),
    orderBy("sortOrder", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(
    (d: { data: () => OrderStatusConfig }) => d.data() as OrderStatusConfig,
  );
}
