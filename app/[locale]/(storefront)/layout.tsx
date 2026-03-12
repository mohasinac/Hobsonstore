import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import { MainContent } from "@/components/layout/MainContent";
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
      {/* Unified fixed header — transparent over hero, solid on scroll */}
      <SiteHeader
        franchises={franchises}
        brands={brands}
        siteConfig={siteConfig}
        announcements={announcements}
      />
      {/* Hero fills behind the transparent header; non-home pages offset by full header height */}
      <MainContent>{children}</MainContent>
      <Footer siteConfig={siteConfig} />
      <BackToTop />
    </>
  );
}
