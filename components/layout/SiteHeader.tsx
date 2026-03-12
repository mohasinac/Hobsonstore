"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnnouncementBar } from "./AnnouncementBar";
import { Navbar } from "./Navbar";
import type { Announcement } from "@/types/content";
import type { Franchise } from "@/types/franchise";
import type { Brand } from "@/types/brand";
import type { SiteConfig } from "@/types/config";

interface SiteHeaderProps {
  franchises: Franchise[];
  brands: Brand[];
  siteConfig: SiteConfig | null;
  announcements: Announcement[];
}

/**
 * Unified fixed header: announcement bar + navbar treated as one transparent unit.
 * On the homepage: transparent until scrolled past 400px (same threshold as
 * BackToTop visibility), then solid.
 * On all other pages: always solid from the start.
 */
export function SiteHeader({ franchises, brands, siteConfig, announcements }: SiteHeaderProps) {
  const pathname = usePathname();
  // localePrefix: "never" — homepage is at / (no locale prefix)
  const isHome = pathname === "/" || /^\/[a-z]{2}(\/)?$/.test(pathname);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Non-home pages are always in the solid state
  const isSolid = !isHome || scrolled;

  return (
    <div
      className={`site-header${isSolid ? " site-header--scrolled" : ""}`}
      style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 40 }}
    >
      <AnnouncementBar announcements={announcements} />
      <Navbar
        franchises={franchises}
        brands={brands}
        siteConfig={siteConfig}
        scrolled={isSolid}
      />
    </div>
  );
}
