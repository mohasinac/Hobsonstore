"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";

const NAV_ITEMS = [
  { href: ROUTES.ACCOUNT, label: "Profile" },
  { href: ROUTES.ACCOUNT_ORDERS, label: "My Orders" },
  { href: ROUTES.ACCOUNT_WISHLIST, label: "My Wishlist" },
  { href: ROUTES.ACCOUNT_ADDRESSES, label: "My Addresses" },
] as const;

export function AccountSidebar() {
  const pathname = usePathname();

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
      </ul>
    </nav>
  );
}
