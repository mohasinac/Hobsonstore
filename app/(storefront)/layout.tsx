import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { getAllCollectionsServer, getSiteConfigServer, getAnnouncementsServer } from "@/lib/firebase/server";

export default async function StorefrontLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [collections, siteConfig, announcements] = await Promise.all([
    getAllCollectionsServer().catch(() => []),
    getSiteConfigServer().catch(() => null),
    getAnnouncementsServer().catch(() => []),
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
