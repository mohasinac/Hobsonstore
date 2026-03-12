"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Drawer } from "@/components/ui/Drawer";
import { ROUTES } from "@/constants/routes";
import type { Franchise } from "@/types/franchise";
import type { Brand } from "@/types/brand";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  franchises: Franchise[];
  brands: Brand[];
}

const NAV_LINKS = [
  { label: "HOME",     href: ROUTES.HOME },
  { label: "SHOP ALL", href: ROUTES.SEARCH },
  { label: "BLOG",     href: ROUTES.BLOG },
  { label: "ABOUT",    href: ROUTES.PAGE("about") },
  { label: "CONTACT",  href: ROUTES.PAGE("contact") },
];

export function MobileMenu({
  open,
  onClose,
  franchises,
  brands,
}: MobileMenuProps) {
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();
  return (
    <Drawer open={open} onClose={onClose} side="left">
      <div
        className="flex flex-col h-full overflow-y-auto"
        style={{ background: "#FFFEF0" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            background: "#FFE500",
            borderBottom: "3px solid #0D0D0D",
          }}
        >
          <span
            className="text-xl tracking-widest"
            style={{
              fontFamily: "var(--font-bangers, Bangers, cursive)",
              color: "#0D0D0D",
            }}
          >
            MENU
          </span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1 rounded"
            style={{ color: "#0D0D0D", fontWeight: 900, fontSize: "1.2rem" }}
          >
            ✕
          </button>
        </div>

        <div className="p-4 flex flex-col gap-6">
          {/* Search box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!searchValue.trim()) return;
              router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchValue.trim())}`);
              setSearchValue("");
              onClose();
            }}
            className="flex items-center gap-2 rounded-md px-3 py-2"
            style={{ background: "#fff", border: "2px solid #0D0D0D", boxShadow: "2px 2px 0px #0D0D0D" }}
          >
            <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search collectibles…"
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
            />
          </form>

          {/* Top-level nav links */}
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className="block px-3 py-2 rounded-md text-base font-black transition-colors"
                style={{
                  fontFamily: "var(--font-bangers, Bangers, cursive)",
                  letterSpacing: "0.08em",
                  color: "#0D0D0D",
                  border: "2px solid transparent",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "#0D0D0D";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#FFE500";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#0D0D0D";
                }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Franchise links */}
          {franchises.length > 0 && (
            <div>
              <p
                className="mb-2 text-xs uppercase tracking-widest px-3"
                style={{
                  fontFamily: "var(--font-bangers, Bangers, cursive)",
                  color: "#E8001C",
                  letterSpacing: "0.12em",
                }}
              >
                By Franchise
              </p>
              <div className="flex flex-col gap-0.5">
                {franchises.map((c) => (
                  <Link
                    key={c.slug}
                    href={ROUTES.FRANCHISE(c.slug)}
                    onClick={onClose}
                    className="block px-3 py-1.5 text-sm font-semibold rounded transition-colors"
                    style={{ color: "#1A1A2E" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#E8001C")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#1A1A2E")}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Brand links */}
          {brands.length > 0 && (
            <div>
              <p
                className="mb-2 text-xs uppercase tracking-widest px-3"
                style={{
                  fontFamily: "var(--font-bangers, Bangers, cursive)",
                  color: "#0057FF",
                  letterSpacing: "0.12em",
                }}
              >
                By Brand
              </p>
              <div className="flex flex-col gap-0.5">
                {brands.map((c) => (
                  <Link
                    key={c.slug}
                    href={ROUTES.BRAND(c.slug)}
                    onClick={onClose}
                    className="block px-3 py-1.5 text-sm font-semibold rounded transition-colors"
                    style={{ color: "#1A1A2E" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#0057FF")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#1A1A2E")}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

