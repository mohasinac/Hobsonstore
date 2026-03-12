"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "⊞" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/orders", label: "Orders", icon: "📋" },
  { href: "/admin/franchises", label: "Franchises", icon: "🎬" },
  { href: "/admin/brands", label: "Brands", icon: "🏭" },
  { href: "/admin/collections", label: "Curated Collections", icon: "🗂" },
  { href: "/admin/content", label: "Content", icon: "🖼" },
  { href: "/admin/blog", label: "Blog", icon: "📝" },
  { href: "/admin/pages", label: "Pages", icon: "📄" },
  { href: "/admin/loyalty", label: "Loyalty", icon: "🪙" },
  { href: "/admin/discounts", label: "Discounts", icon: "🏷" },
  { href: "/admin/config", label: "Config", icon: "⚙" },
  { href: "/admin/config/integrations", label: "Integrations", icon: "🔑" },
  { href: "/admin/seed", label: "Seed Data", icon: "🌱" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0">
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-red-50 text-red-700"
                  : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
