// app/layout.tsx — root shell required by Next.js (must contain <html> and <body>)
// Locale-aware providers live in app/[locale]/layout.tsx.
import type { ReactNode } from "react";
import { Inter, Bangers } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bangers = Bangers({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bangers",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${bangers.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

