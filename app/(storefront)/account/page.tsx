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
      <h1 className="text-2xl font-extrabold text-gray-900">My Account</h1>

      {/* Profile info */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-500">
          Profile
        </h2>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500">Name</dt>
            <dd className="font-medium text-gray-900">
              {profile?.displayName ?? user?.displayName ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium text-gray-900">
              {profile?.email ?? user?.email ?? "—"}
            </dd>
          </div>
          {profile?.phone && (
            <div>
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium text-gray-900">{profile.phone}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Coins */}
      <CoinBalanceCard
        balance={profile?.fccCoins ?? 0}
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
            className="flex items-center justify-center rounded-xl border border-gray-100 bg-white p-5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-red-300 hover:text-red-600"
          >
            {label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
