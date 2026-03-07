import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  runTransaction,
  serverTimestamp,
  getFirestore,
} from "firebase/firestore";
import { getFirebaseApp } from "./client";
import { COLLECTIONS } from "@/constants/firebase";
import type { Order, OrderStatus } from "@/types/order";
import type { CartItem } from "@/types/cart";
import type { Address } from "@/types/order";

function getDb() {
  return getFirestore(getFirebaseApp());
}

export interface CreateOrderPayload {
  userId: string;
  items: CartItem[];
  address: Address;
  subtotal: number;
  coinsRedeemed: number;
  discountCode?: string;
  discountAmount: number;
  total: number;
  isPreorder: boolean;
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<string> {
  const db = getDb();

  return await runTransaction(db, async (tx) => {
    // Check and reserve stock for each item
    for (const item of payload.items) {
      const productRef = doc(db, COLLECTIONS.PRODUCTS, item.productId);
      const productSnap = await tx.get(productRef);
      if (!productSnap.exists())
        throw new Error(`Product ${item.productId} not found`);

      const data = productSnap.data();
      const available = (data["availableStock"] as number) ?? 0;
      if (!data["isPreorder"] && available < item.qty) {
        throw new Error(`Insufficient stock for ${item.name}`);
      }

      tx.update(productRef, {
        reservedStock: ((data["reservedStock"] as number) ?? 0) + item.qty,
        availableStock: available - item.qty,
      });
    }

    // Write order document
    const orderRef = doc(collection(db, COLLECTIONS.ORDERS));
    tx.set(orderRef, {
      ...payload,
      currentStatus: "pending_payment" as OrderStatus,
      statusHistory: [
        {
          status: "pending_payment",
          timestamp: serverTimestamp(),
          updatedBy: "system",
        },
      ],
      whatsappSent: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return orderRef.id;
  });
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, COLLECTIONS.ORDERS, orderId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTIONS.ORDERS),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
}
