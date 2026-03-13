"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { getUser } from "@/lib/firebase/users";

const NAV_ITEMS = [
  { href: ROUTES.ACCOUNT, label: "Profile" },
  { href: ROUTES.ACCOUNT_ORDERS, label: "My Orders" },
  { href: ROUTES.ACCOUNT_WISHLIST, label: "My Wishlist" },
  { href: ROUTES.ACCOUNT_ADDRESSES, label: "My Addresses" },
] as const;

export function AccountSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUser(user.uid).then((profile) => {
      setIsAdmin(profile?.role === "admin");
    });
  }, [user]);

  return (
    <nav
      className="w-full p-4 sm:w-48 sm:shrink-0"
      style={{
        background: "var(--surface-warm)",
        border: "2px solid var(--border-ink)",
        boxShadow: "3px 3px 0px var(--border-ink)",
      }}
    >
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label }) => {
          const active =
            href === ROUTES.ACCOUNT
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className="block px-3 py-2 text-sm font-bold transition-colors"
                style={{
                  color: active ? "var(--color-red)" : "var(--color-black)",
                  background: active ? "rgba(248,58,58,0.08)" : "transparent",
                  borderLeft: active ? "3px solid var(--color-red)" : "3px solid transparent",
                }}
              >
                {label}
              </Link>
            </li>
          );
        })}
        {isAdmin && (
          <li>
            <Link
              href={ROUTES.ADMIN}
              className="block px-3 py-2 text-sm font-bold transition-colors"
              style={{
                color: "var(--color-black)",
                background: "transparent",
                borderLeft: "3px solid transparent",
              }}
            >
              Admin Panel
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
