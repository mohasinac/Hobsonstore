"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ROUTES } from "@/constants/routes";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import type { Collection } from "@/types/content";
import type { SiteConfig } from "@/types/config";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { MobileMenu } from "./MobileMenu";

interface NavbarProps {
  collections: Collection[];
  siteConfig: SiteConfig | null;
}

export function Navbar({ collections, siteConfig }: NavbarProps) {
  const { itemCount } = useCart();
  const { productIds } = useWishlist();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const franchiseCollections = collections.filter((c) => c.type === "franchise");
  const brandCollections = collections.filter((c) => c.type === "brand");

  return (
    <>
      {/* ── Comic-style sticky navbar ── */}
      <header
        className="sticky top-0 z-30"
        style={{
          background: "#FFE500",
          borderBottom: "3px solid #0D0D0D",
          boxShadow: "0 3px 0px #0D0D0D",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 gap-4">

          {/* ── Logo ── */}
          <Link
            href={ROUTES.HOME}
            className="flex-shrink-0"
            style={{ fontFamily: "var(--font-bangers, Bangers, cursive)" }}
          >
            {siteConfig?.logoUrl ? (
              <Image
                src={siteConfig.logoUrl}
                alt={siteConfig.siteName ?? "Hobson Collectibles"}
                width={150}
                height={44}
                priority
                style={{ filter: "drop-shadow(2px 2px 0px #0D0D0D)" }}
              />
            ) : (
              <span
                className="text-2xl tracking-widest"
                style={{
                  fontFamily: "var(--font-bangers, Bangers, cursive)",
                  color: "#0D0D0D",
                  textShadow: "2px 2px 0px rgba(0,0,0,0.25)",
                  letterSpacing: "0.08em",
                }}
              >
                HOBSON COLLECTIBLES
              </span>
            )}
          </Link>

          {/* ── Desktop nav links ── */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-bold">

            {/* Collections mega-menu */}
            <div className="group relative">
              <button
                className="flex items-center gap-1 px-3 py-2 rounded-md transition-colors"
                style={{ color: "#0D0D0D" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#0D0D0D";
                  (e.currentTarget as HTMLButtonElement).style.color = "#FFE500";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "#0D0D0D";
                }}
              >
                <span style={{ fontFamily: "var(--font-bangers, Bangers, cursive)", letterSpacing: "0.06em", fontSize: "1rem" }}>
                  COLLECTIONS
                </span>
                <span aria-hidden="true" className="text-xs">▾</span>
              </button>

              {/* Mega-menu */}
              <div
                className="invisible group-hover:visible absolute left-0 top-full z-40 w-[620px] grid grid-cols-2 gap-6 p-6"
                style={{
                  background: "#FFFEF0",
                  border: "3px solid #0D0D0D",
                  boxShadow: "6px 6px 0px #0D0D0D",
                  marginTop: "3px",
                }}
              >
                <div>
                  <p
                    className="mb-3 text-xs uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-bangers, Bangers, cursive)", color: "#E8001C", letterSpacing: "0.1em", fontSize: "0.8rem" }}
                  >
                    By Franchise
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {franchiseCollections.slice(0, 16).map((c) => (
                      <Link
                        key={c.slug}
                        href={ROUTES.COLLECTION(c.slug)}
                        className="text-sm font-semibold truncate transition-colors"
                        style={{ color: "#1A1A2E" }}
                        onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "#E8001C")}
                        onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "#1A1A2E")}
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <p
                    className="mb-3 text-xs uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-bangers, Bangers, cursive)", color: "#0057FF", letterSpacing: "0.1em", fontSize: "0.8rem" }}
                  >
                    By Brand
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {brandCollections.slice(0, 16).map((c) => (
                      <Link
                        key={c.slug}
                        href={ROUTES.COLLECTION(c.slug)}
                        className="text-sm font-semibold truncate transition-colors"
                        style={{ color: "#1A1A2E" }}
                        onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "#0057FF")}
                        onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "#1A1A2E")}
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 pt-3" style={{ borderTop: "2px solid #0D0D0D" }}>
                  <Link
                    href={ROUTES.COLLECTIONS}
                    className="inline-flex items-center gap-1 text-sm font-bold"
                    style={{ color: "#E8001C" }}
                  >
                    View all collections →
                  </Link>
                </div>
              </div>
            </div>

            {/* Static nav items */}
            {([
              { label: "SHOP ALL",  href: ROUTES.SEARCH },
              { label: "BLOG",      href: ROUTES.BLOG },
              { label: "ABOUT",     href: ROUTES.PAGE("about") },
              { label: "CONTACT",   href: ROUTES.PAGE("contact") },
            ] as { label: string; href: string }[]).map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-2 rounded-md text-sm transition-colors"
                style={{
                  fontFamily: "var(--font-bangers, Bangers, cursive)",
                  letterSpacing: "0.06em",
                  fontSize: "1rem",
                  color: "#0D0D0D",
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

          {/* ── Action icons ── */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Link
              href={ROUTES.SEARCH}
              aria-label="Search"
              className="p-2 rounded-md transition-colors"
              style={{ color: "#0D0D0D" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "#0D0D0D";
                (e.currentTarget as HTMLAnchorElement).style.color = "#FFE500";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                (e.currentTarget as HTMLAnchorElement).style.color = "#0D0D0D";
              }}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </Link>

            {/* Account */}
            <Link
              href={ROUTES.ACCOUNT}
              aria-label="Account"
              className="p-2 rounded-md transition-colors"
              style={{ color: "#0D0D0D" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "#0D0D0D";
                (e.currentTarget as HTMLAnchorElement).style.color = "#FFE500";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                (e.currentTarget as HTMLAnchorElement).style.color = "#0D0D0D";
              }}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z" />
              </svg>
            </Link>

            {/* Wishlist */}
            <Link
              href={ROUTES.ACCOUNT_WISHLIST}
              aria-label={`Wishlist (${productIds.length})`}
              className="relative p-2 rounded-md transition-colors"
              style={{ color: "#0D0D0D" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "#0D0D0D";
                (e.currentTarget as HTMLAnchorElement).style.color = "#FFE500";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                (e.currentTarget as HTMLAnchorElement).style.color = "#0D0D0D";
              }}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 0 1 6.364 0L12 7.636l1.318-1.318a4.5 4.5 0 1 1 6.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 0 1 0-6.364z" />
              </svg>
              {productIds.length > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center text-[10px] font-black"
                  style={{ background: "#E8001C", color: "#fff", border: "2px solid #0D0D0D", borderRadius: "50%" }}
                >
                  {productIds.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              aria-label={`Cart (${itemCount()} items)`}
              className="relative p-2 rounded-md transition-colors"
              style={{ color: "#0D0D0D" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#0D0D0D";
                (e.currentTarget as HTMLButtonElement).style.color = "#FFE500";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "#0D0D0D";
              }}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m4-9l2 9" />
              </svg>
              {itemCount() > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center text-[10px] font-black"
                  style={{ background: "#E8001C", color: "#fff", border: "2px solid #0D0D0D", borderRadius: "50%" }}
                >
                  {itemCount()}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-md transition-colors"
              style={{ color: "#0D0D0D" }}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#0D0D0D";
                (e.currentTarget as HTMLButtonElement).style.color = "#FFE500";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "#0D0D0D";
              }}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        franchiseCollections={franchiseCollections}
        brandCollections={brandCollections}
      />
    </>
  );
}
