"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getUser } from "@/lib/firebase/users";
import { CoinBalanceCard } from "@/components/account/CoinBalanceCard";
import { Spinner } from "@/components/ui/Spinner";
import { ROUTES } from "@/constants/routes";
import type { User } from "@/types/user";

export default function AccountPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (user) {
      getUser(user.uid)
        .then(setProfile)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1
        className="font-comic"
        style={{
          fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
          color: "var(--section-title-color)",
        }}
      >
        MY ACCOUNT
      </h1>

      {/* Profile info */}
      <div
        className="p-6"
        style={{
          background: "var(--card-bg)",
          border: "var(--card-border)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <h2 className="mb-4 text-sm font-black uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
          Profile
        </h2>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt style={{ color: "var(--color-muted)" }}>Name</dt>
            <dd className="font-bold" style={{ color: "var(--color-black)" }}>
              {profile?.displayName ?? user?.displayName ?? "—"}
            </dd>
          </div>
          <div>
            <dt style={{ color: "var(--color-muted)" }}>Email</dt>
            <dd className="font-bold" style={{ color: "var(--color-black)" }}>
              {profile?.email ?? user?.email ?? "—"}
            </dd>
          </div>
          {profile?.phone && (
            <div>
              <dt style={{ color: "var(--color-muted)" }}>Phone</dt>
              <dd className="font-bold" style={{ color: "var(--color-black)" }}>{profile.phone}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Coins */}
      <CoinBalanceCard
        balance={profile?.hcCoins ?? 0}
        history={profile?.coinHistory ?? []}
      />

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { href: ROUTES.ACCOUNT_ORDERS, label: "My Orders" },
          { href: ROUTES.ACCOUNT_WISHLIST, label: "My Wishlist" },
          { href: ROUTES.ACCOUNT_ADDRESSES, label: "My Addresses" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-center p-5 text-sm font-black uppercase transition-transform hover:-translate-y-1"
            style={{
              border: "var(--card-border)",
              boxShadow: "var(--card-shadow)",
              background: "var(--card-bg)",
              color: "var(--color-black)",
              letterSpacing: "0.04em",
            }}
          >
            {label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
