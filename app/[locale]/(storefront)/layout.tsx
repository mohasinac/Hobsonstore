import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import {
  getAllFranchisesServer,
  getAllBrandsServer,
  getSiteConfigServer,
  getAnnouncementsServer,
} from "@/lib/firebase/server";

export default async function StorefrontLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [franchises, brands, siteConfig, announcements] = await Promise.all([
    getAllFranchisesServer().catch(() => []),
    getAllBrandsServer().catch(() => []),
    getSiteConfigServer().catch(() => null),
    getAnnouncementsServer().catch(() => []),
  ]);

  return (
    <>
      <AnnouncementBar announcements={announcements} />
      <Navbar franchises={franchises} brands={brands} siteConfig={siteConfig} />
      <main>{children}</main>
      <Footer siteConfig={siteConfig} />
    </>
  );
}
