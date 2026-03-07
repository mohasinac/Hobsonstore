"use client";

import { ToastProvider } from "@/components/ui/ToastProvider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
