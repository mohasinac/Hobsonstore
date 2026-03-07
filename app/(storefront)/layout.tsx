import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { getAllCollections } from "@/lib/firebase/collections";
import { getSiteConfig } from "@/lib/firebase/config";
import { getAnnouncements } from "@/lib/firebase/content";

export default async function StorefrontLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [collections, siteConfig, announcements] = await Promise.all([
    getAllCollections().catch(() => []),
    getSiteConfig().catch(() => null),
    getAnnouncements().catch(() => []),
  ]);

  return (
    <>
      <AnnouncementBar announcements={announcements} />
      <Navbar collections={collections} siteConfig={siteConfig} />
      <main>{children}</main>
      <Footer siteConfig={siteConfig} />
    </>
  );
}
