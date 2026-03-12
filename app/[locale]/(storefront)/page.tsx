import type { Metadata } from "next";
import { getBannersServer, getHomeSectionsServer, getTestimonialsServer, getFAQServer, getPromoBannersServer, getAllFranchisesServer, getAllBrandsServer, getCharacterHotspotConfigServer, getTrustBadgesServer } from "@/lib/firebase/server";
import { HeroBanner } from "@/components/home/HeroBanner";
import { FranchiseStrip } from "@/components/home/FranchiseStrip";
import { BrandStrip } from "@/components/home/BrandStrip";
import { HomeSectionList } from "@/components/home/HomeSectionList";
import { PromoGrid } from "@/components/home/PromoGrid";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { FAQAccordion } from "@/components/home/FAQAccordion";
import { TrustBadges } from "@/components/home/TrustBadges";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";
import { CharacterHotspot } from "@/components/home/CharacterHotspot";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Hobson Collectibles — Premium Action Figures & Statues",
  description:
    "India's premier destination for licensed action figures, statues, and pop-culture collectibles from Hot Toys, Sideshow, Iron Studios, and more.",
};

export default async function HomePage() {
  const [
    banners,
    franchises,
    brands,
    sections,
    promoBanners,
    testimonials,
    faqItems,
    hotspotConfig,
    trustBadges,
  ] = await Promise.all([
    getBannersServer().catch(() => []),
    getAllFranchisesServer().catch(() => []),
    getAllBrandsServer().catch(() => []),
    getHomeSectionsServer().catch(() => []),
    getPromoBannersServer().catch(() => []),
    getTestimonialsServer(true).catch(() => []),
    getFAQServer().catch(() => []),
    getCharacterHotspotConfigServer().catch(() => null),
    getTrustBadgesServer().catch(() => []),
  ]);

  return (
    <div>
      {/* Hero carousel */}
      <HeroBanner banners={banners} />

      {/* Franchise + Brand — together fill at least one viewport height minus header */}
      <div style={{ minHeight: "calc(100svh - var(--header-height))", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <FranchiseStrip franchises={franchises} />
        <BrandStrip brands={brands} />
      </div>

      {/* Interactive character hotspot — DC / Marvel / Anime */}
      <CharacterHotspot config={hotspotConfig} />

      {/* Featured + Bestsellers rows */}
      <HomeSectionList sections={sections} />

      {/* Mid-page promo banners */}
      <PromoGrid banners={promoBanners} />

      {/* Testimonials */}
      <TestimonialsCarousel testimonials={testimonials} />

      {/* FAQ */}
      <FAQAccordion items={faqItems} />

      {/* Trust badge strip */}
      <TrustBadges badges={trustBadges} />

      {/* Newsletter — two-column dramatic CTA */}
      <section
        style={{
          background: "#0D0D0D",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-20">
            {/* Left: value proposition */}
            <div className="flex-1">
              <p
                className="mb-2 text-xs font-black uppercase tracking-widest"
                style={{ color: "#E8001C", letterSpacing: "0.18em" }}
              >
                EXCLUSIVE ACCESS
              </p>
              <h2
                className="mb-4"
                style={{
                  fontFamily: "var(--font-bangers, Bangers, cursive)",
                  fontSize: "clamp(2rem, 5vw, 3.2rem)",
                  letterSpacing: "0.08em",
                  color: "#FFFFFF",
                  lineHeight: 1.05,
                }}
              >
                JOIN THE INNER CIRCLE
              </h2>
              <ul className="flex flex-col gap-2">
                {[
                  "First look at new arrivals & limited drops",
                  "Pre-order alerts before they sell out",
                  "Member-only promo codes & early access sales",
                  "Behind-the-scenes from the world of collectibles",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm font-medium" style={{ color: "#94A3B8" }}>
                    <span style={{ color: "#FFE500", flexShrink: 0, marginTop: "2px" }}>▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: signup form */}
            <div
              className="w-full max-w-md rounded-none p-8 lg:w-auto lg:shrink-0"
              style={{
                background: "#111118",
                border: "1px solid rgba(255,229,0,0.2)",
              }}
            >
              <p
                className="mb-1 text-xs font-black uppercase tracking-widest"
                style={{ color: "#FFE500", letterSpacing: "0.14em" }}
              >
                NO SPAM. EVER.
              </p>
              <p className="mb-5 text-sm font-semibold" style={{ color: "#E2E8F0" }}>
                Drop your email and we&apos;ll handle the rest.
              </p>
              <NewsletterSignup />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
