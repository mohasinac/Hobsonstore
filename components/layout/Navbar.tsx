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

  const franchiseCollections = collections.filter(
    (c) => c.type === "franchise",
  );
  const brandCollections = collections.filter((c) => c.type === "brand");

  return (
    <>
      <header className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link
            href={ROUTES.HOME}
            className="flex-shrink-0 font-bold text-xl tracking-tight text-gray-900"
          >
            {siteConfig?.logoUrl ? (
              <Image
                src={siteConfig.logoUrl}
                alt={siteConfig.siteName ?? "FatCat Collectibles"}
                width={140}
                height={40}
                priority
              />
            ) : (
              <span>FATCAT COLLECTIBLES</span>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <div className="group relative">
              <button className="flex items-center gap-1 text-gray-700 hover:text-red-600">
                Collections
                <span aria-hidden="true">▾</span>
              </button>
              {/* Mega-menu dropdown */}
              <div className="invisible absolute left-0 top-full mt-1 w-[600px] rounded-lg bg-white p-6 shadow-xl group-hover:visible grid grid-cols-2 gap-6 z-40">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    Browse by Franchise
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {franchiseCollections.slice(0, 14).map((c) => (
                      <Link
                        key={c.slug}
                        href={ROUTES.COLLECTION(c.slug)}
                        className="text-sm text-gray-700 hover:text-red-600 truncate"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    Browse by Brand
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {brandCollections.slice(0, 14).map((c) => (
                      <Link
                        key={c.slug}
                        href={ROUTES.COLLECTION(c.slug)}
                        className="text-sm text-gray-700 hover:text-red-600 truncate"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Action icons */}
          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.SEARCH}
              aria-label="Search"
              className="text-gray-600 hover:text-red-600"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
            </Link>
            <Link
              href={ROUTES.ACCOUNT}
              aria-label="Account"
              className="text-gray-600 hover:text-red-600"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"
                />
              </svg>
            </Link>
            <Link
              href={ROUTES.ACCOUNT_WISHLIST}
              aria-label={`Wishlist (${productIds.length})`}
              className="relative text-gray-600 hover:text-red-600"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 0 1 6.364 0L12 7.636l1.318-1.318a4.5 4.5 0 1 1 6.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 0 1 0-6.364z"
                />
              </svg>
              {productIds.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                  {productIds.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              aria-label={`Cart (${itemCount()} items)`}
              className="relative text-gray-600 hover:text-red-600"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m4-9l2 9"
                />
              </svg>
              {itemCount() > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                  {itemCount()}
                </span>
              )}
            </button>
            {/* Mobile hamburger */}
            <button
              className="md:hidden text-gray-600"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
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
