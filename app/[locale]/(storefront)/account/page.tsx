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
        style={{
          fontFamily: "var(--font-bangers, Bangers, cursive)",
          fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
          letterSpacing: "0.06em",
          color: "#0D0D0D",
        }}
      >
        MY ACCOUNT
      </h1>

      {/* Profile info */}
      <div
        className="p-6"
        style={{
          background: "#FFFFFF",
          border: "2px solid #0D0D0D",
          boxShadow: "3px 3px 0px #0D0D0D",
        }}
      >
        <h2 className="mb-4 text-sm font-black uppercase tracking-widest" style={{ color: "#6B6B6B" }}>
          Profile
        </h2>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt style={{ color: "#6B6B6B" }}>Name</dt>
            <dd className="font-bold" style={{ color: "#0D0D0D" }}>
              {profile?.displayName ?? user?.displayName ?? "—"}
            </dd>
          </div>
          <div>
            <dt style={{ color: "#6B6B6B" }}>Email</dt>
            <dd className="font-bold" style={{ color: "#0D0D0D" }}>
              {profile?.email ?? user?.email ?? "—"}
            </dd>
          </div>
          {profile?.phone && (
            <div>
              <dt style={{ color: "#6B6B6B" }}>Phone</dt>
              <dd className="font-bold" style={{ color: "#0D0D0D" }}>{profile.phone}</dd>
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
              border: "2px solid #0D0D0D",
              boxShadow: "3px 3px 0px #0D0D0D",
              background: "#FFFFFF",
              color: "#0D0D0D",
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
