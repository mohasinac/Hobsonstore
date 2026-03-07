import type { Metadata } from "next";
import { Inter, Bangers } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bangers = Bangers({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bangers",
});

export const metadata: Metadata = {
  title: {
    default: "Hobson Collectibles",
    template: "%s | Hobson Collectibles",
  },
  description:
    "Premium collectibles — action figures, statues & pop-culture merchandise.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${bangers.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
