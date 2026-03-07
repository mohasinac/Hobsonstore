"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, getFirestore } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/constants/firebase";
import type { OrderStatusConfig } from "@/types/config";

export function useOrderStatusConfig() {
  const [configs, setConfigs] = useState<OrderStatusConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore(getFirebaseApp());
    const q = query(
      collection(db, COLLECTIONS.ORDER_STATUS_CONFIG),
      orderBy("sortOrder", "asc"),
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setConfigs(snap.docs.map((d) => ({ ...d.data() }) as OrderStatusConfig));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { configs, loading };
}
