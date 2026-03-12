"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Applies full header offset on every page except the home route (where the hero extends behind the navbar). */
export function MainContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // localePrefix: "never" — homepage is at / (no locale prefix)
  const isHome = pathname === "/" || /^\/[a-z]{2}(\/)?$/.test(pathname);

  return (
    <main
      style={{
        // Home: hero fills from y=0 beneath the fully transparent header.
        // All other pages: offset by full header height so content isn't hidden.
        paddingTop: isHome ? 0 : "var(--header-height)",
      }}
    >
      {children}
    </main>
  );
}
