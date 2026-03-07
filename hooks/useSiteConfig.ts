"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, getFirestore } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/constants/firebase";
import type { SiteConfig } from "@/types/config";

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore(getFirebaseApp());
    const unsubscribe = onSnapshot(
      doc(db, COLLECTIONS.SITE_CONFIG, "main"),
      (snap) => {
        setConfig(snap.exists() ? (snap.data() as SiteConfig) : null);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  return { config, loading };
}
