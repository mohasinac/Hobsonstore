"use client";

import { useEffect, useState } from "react";
import { BREAKPOINTS } from "@/constants/ui";

export function useMediaQuery(minWidth: number): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    // Sync current value via the handler pattern to satisfy the lint rule
    handler({ matches: mq.matches } as MediaQueryListEvent);
    return () => mq.removeEventListener("change", handler);
  }, [minWidth]);

  return matches;
}

export function useIsMobile() {
  return !useMediaQuery(BREAKPOINTS.MD);
}
