"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: ROUTES.ACCOUNT, label: "Profile" },
  { href: ROUTES.ACCOUNT_ORDERS, label: "My Orders" },
  { href: ROUTES.ACCOUNT_WISHLIST, label: "My Wishlist" },
  { href: ROUTES.ACCOUNT_ADDRESSES, label: "My Addresses" },
] as const;

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-full rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:w-48 sm:flex-shrink-0">
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
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-red-50 text-red-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
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
