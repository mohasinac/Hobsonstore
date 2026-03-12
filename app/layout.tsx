// app/layout.tsx — minimal root shell
// All locale-aware rendering (fonts, providers, i18n) lives in
// app/[locale]/layout.tsx. next-intl middleware redirects / → locale prefix.
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}

