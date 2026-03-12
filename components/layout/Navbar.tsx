"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ROUTES } from "@/constants/routes";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { getUser } from "@/lib/firebase/users";
import type { Franchise } from "@/types/franchise";
import type { Brand } from "@/types/brand";
import type { SiteConfig } from "@/types/config";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { MobileMenu } from "./MobileMenu";
import { SearchDialog } from "./SearchDialog";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface NavbarProps {
  franchises: Franchise[];
  brands: Brand[];
  siteConfig: SiteConfig | null;
  /** When true the navbar starts transparent and overlays the hero */
  overlay?: boolean;
  /** Scroll state provided by SiteHeader; when omitted Navbar tracks scroll internally */
  scrolled?: boolean;
}

export function Navbar({ franchises, brands, siteConfig, overlay = true, scrolled: externalScrolled }: NavbarProps) {
  const { itemCount } = useCart();
  const { productIds } = useWishlist();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [localScrolled, setLocalScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Use externally-provided scrolled state (from SiteHeader) when available,
  // otherwise track internally for standalone overlay usage.
  const scrolled = externalScrolled ?? localScrolled;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    // Skip internal tracking when SiteHeader controls the scroll state
    if (externalScrolled !== undefined || !overlay) return;
    const onScroll = () => setLocalScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay, externalScrolled]);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    getUser(user.uid).then((profile) => setIsAdmin(profile?.role === "admin"));
  }, [user]);

  // Colour tokens are fully CSS-var driven via .navbar-overlay / .navbar-scrolled classes.
  // This eliminates the resolvedTheme flash where dark users saw dark-on-dark text pre-hydration.

  return (
    <>
      {/* ── Transparent-overlay / solid-on-scroll navbar ── */}
      <header
        className={`navbar-overlay${!overlay ? " navbar-static" : ""}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-8 gap-4" style={{ height: "var(--navbar-height, 64px)" }}>

          {/* ── Logo ── */}
          <Link
            href={ROUTES.HOME}
            className="shrink-0 min-w-0"
          >
            {siteConfig?.logoUrl ? (
              <Image
                src={siteConfig.logoUrl}
                alt={siteConfig.siteName ?? "Hobson Collectibles"}
                width={150}
                height={44}
                priority
                style={{ filter: "var(--nb-logo-filter)" }}
              />
            ) : (
              <span
                className="tracking-widest transition-colors duration-300 whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-bangers, Bangers, cursive)",
                  color: "var(--nb-logo)",
                  textShadow: "var(--nb-text-shadow)",
                  letterSpacing: "0.08em",
                  fontSize: "clamp(1rem, 3.5vw, 1.5rem)",
                }}
              >
                <span className="sm:hidden">HOBSON</span>
                <span className="hidden sm:inline">HOBSON COLLECTIBLES</span>
              </span>
            )}
          </Link>

          {/* ── Desktop nav links ── */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-bold">

            {/* Collections mega-menu */}
            <div className="group relative">
              <button
                className="flex items-center gap-1 px-3 py-2 rounded-md transition-colors duration-200"
                style={{ color: "var(--nb-text)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--nb-hover)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--color-yellow)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--nb-text)";
                }}
              >
                <span style={{ fontFamily: "var(--font-bangers, Bangers, cursive)", letterSpacing: "0.06em", fontSize: "1rem" }}>
                  COLLECTIONS
                </span>
                <span aria-hidden="true" className="text-xs">▾</span>
              </button>

              {/* Mega-menu */}
              <div
                className="invisible group-hover:visible absolute left-0 top-full z-40 w-155 grid grid-cols-2 gap-6 p-6 mega-menu"
                style={{ marginTop: "0px" }}
              >
                <div>
                  <p
                    className="mb-3 text-xs uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-bangers, Bangers, cursive)", color: "var(--section-label-color)", letterSpacing: "0.1em", fontSize: "0.8rem" }}
                  >
                    By Franchise
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {franchises.slice(0, 16).map((c) => (
                      <Link
                        key={c.slug}
                        href={ROUTES.FRANCHISE(c.slug)}
                        className="text-sm font-semibold truncate mega-menu__link"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <p
                    className="mb-3 text-xs uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-bangers, Bangers, cursive)", color: "var(--color-blue)", letterSpacing: "0.1em", fontSize: "0.8rem" }}
                  >
                    By Brand
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {brands.slice(0, 16).map((c) => (
                      <Link
                        key={c.slug}
                        href={ROUTES.BRAND(c.slug)}
                        className="text-sm font-semibold truncate mega-menu__link"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 pt-3 mega-menu__divider">
                  <Link
                    href={ROUTES.FRANCHISES}
                    className="inline-flex items-center gap-1 text-sm font-bold mr-6"
                    style={{ color: "var(--section-label-color)" }}
                  >
                    All franchises →
                  </Link>
                  <Link
                    href={ROUTES.BRANDS}
                    className="inline-flex items-center gap-1 text-sm font-bold"
                    style={{ color: "var(--color-blue)" }}
                  >
                    All brands →
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
                className="px-3 py-2 rounded-md text-sm transition-colors duration-200"
                style={{
                  fontFamily: "var(--font-bangers, Bangers, cursive)",
                  letterSpacing: "0.06em",
                  fontSize: "1rem",
                  color: "var(--nb-text)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "var(--nb-hover)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-yellow)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--nb-text)";
                }}
              >
                {label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                href="/seed"
                className="px-3 py-2 rounded-md text-sm transition-colors duration-200"
                style={{
                  fontFamily: "var(--font-bangers, Bangers, cursive)",
                  letterSpacing: "0.06em",
                  fontSize: "1rem",
                  color: "var(--color-yellow)",
                  background: "rgba(248,58,58,0.18)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(248,58,58,0.35)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(248,58,58,0.18)";
                }}
              >
                SEED
              </Link>
            )}
          </nav>

          {/* ── Action icons ── */}
          <div className="flex items-center gap-2">
            {/* Search dialog (desktop) */}
            <SearchDialog iconColor="var(--nb-icon)" iconHoverBg="var(--nb-hover)" />

            {/* Account */}
            <Link
              href={ROUTES.ACCOUNT}
              aria-label="Account"
              className="p-2 rounded-md transition-colors duration-200"
              style={{ color: "var(--nb-icon)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "var(--nb-hover)";
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-yellow)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--nb-icon)";
              }}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z" />
              </svg>
            </Link>

            {/* Wishlist */}
            <Link
              href={ROUTES.ACCOUNT_WISHLIST}
              aria-label={`Wishlist (${mounted ? productIds.length : 0})`}
              className="relative p-2 rounded-md transition-colors duration-200"
              style={{ color: "var(--nb-icon)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "var(--nb-hover)";
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-yellow)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--nb-icon)";
              }}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 0 1 6.364 0L12 7.636l1.318-1.318a4.5 4.5 0 1 1 6.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 0 1 0-6.364z" />
              </svg>
              {mounted && productIds.length > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center text-[10px] font-black"
                  style={{ background: "var(--color-red)", color: "#fff", border: "2px solid rgba(0,0,0,0.6)", borderRadius: "50%" }}
                >
                  {productIds.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              aria-label={`Cart (${mounted ? itemCount() : 0} items)`}
              className="relative p-2 rounded-md transition-colors duration-200"
              style={{ color: "var(--nb-icon)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--nb-hover)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--color-yellow)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--nb-icon)";
              }}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m4-9l2 9" />
              </svg>
              {mounted && itemCount() > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center text-[10px] font-black"
                  style={{ background: "var(--color-red)", color: "#fff", border: "2px solid rgba(0,0,0,0.6)", borderRadius: "50%" }}
                >
                  {itemCount()}
                </span>
              )}
            </button>

            {/* ThemeToggle */}
            <ThemeToggle iconColor="var(--nb-icon)" iconHoverBg="var(--nb-hover)" />

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-md transition-colors duration-200"
              style={{ color: "var(--nb-icon)" }}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--nb-hover)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--color-yellow)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--nb-icon)";
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
        franchises={franchises}
        brands={brands}
      />
    </>
  );
}
