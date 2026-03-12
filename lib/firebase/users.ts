import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
  getFirestore,
} from "firebase/firestore";
import { getFirebaseApp } from "./client";
import { COLLECTIONS } from "@/constants/firebase";
import type { User, CoinHistoryEntry } from "@/types/user";
import type { Address } from "@/types/order";

function getDb() {
  return getFirestore(getFirebaseApp());
}

export async function getUser(uid: string): Promise<User | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  if (!snap.exists()) return null;
  return snap.data() as User;
}

export async function updateUser(
  uid: string,
  data: Partial<Pick<User, "displayName" | "phone" | "photoURL">>,
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function addAddress(
  uid: string,
  address: Address & { id: string; isDefault: boolean },
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    addresses: arrayUnion(address),
  });
}

export async function removeAddress(
  uid: string,
  address: Address & { id: string; isDefault: boolean },
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    addresses: arrayRemove(address),
  });
}

export async function awardCoins(
  uid: string,
  delta: number,
  reason: CoinHistoryEntry["reason"],
  orderId?: string,
): Promise<void> {
  const db = getDb();
  const entry: CoinHistoryEntry = {
    delta,
    reason,
    ...(orderId ? { orderId } : {}),
    timestamp: serverTimestamp() as CoinHistoryEntry["timestamp"],
  };
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    hcCoins: increment(delta),
    coinHistory: arrayUnion(entry),
  });
}

export async function redeemCoins(
  uid: string,
  amount: number,
  orderId: string,
): Promise<void> {
  const db = getDb();
  const entry: CoinHistoryEntry = {
    delta: -amount,
    reason: "redemption",
    orderId,
    timestamp: serverTimestamp() as CoinHistoryEntry["timestamp"],
  };
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    hcCoins: increment(-amount),
    coinHistory: arrayUnion(entry),
  });
}
