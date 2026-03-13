"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase/client";
import { getUser } from "@/lib/firebase/users";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const auth = getAuth(getFirebaseApp());
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          router.replace("/login");
          return;
        }
        const profile = await getUser(user.uid);
        if (profile?.role !== "admin") {
          router.replace("/");
          return;
        }
        setReady(true);
      } catch {
        router.replace("/login");
      }
    });
    return unsubscribe;
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-surface)" }}>
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
