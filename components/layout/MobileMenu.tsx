"use client";

import Link from "next/link";
import { Drawer } from "@/components/ui/Drawer";
import { ROUTES } from "@/constants/routes";
import type { Collection } from "@/types/content";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  franchiseCollections: Collection[];
  brandCollections: Collection[];
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
  franchiseCollections,
  brandCollections,
}: MobileMenuProps) {
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

          {/* Franchise collections */}
          {franchiseCollections.length > 0 && (
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
                {franchiseCollections.map((c) => (
                  <Link
                    key={c.slug}
                    href={ROUTES.COLLECTION(c.slug)}
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

          {/* Brand collections */}
          {brandCollections.length > 0 && (
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
                {brandCollections.map((c) => (
                  <Link
                    key={c.slug}
                    href={ROUTES.COLLECTION(c.slug)}
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

